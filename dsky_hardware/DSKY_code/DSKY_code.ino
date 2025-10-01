#include <MCUFRIEND_kbv.h>
#include <Adafruit_GFX.h>    // required dependency

MCUFRIEND_kbv tft;

// ================== Button Pin Definitions ==================
#define BTN_VERB     53
#define BTN_NOUN     51
#define BTN_PRO      30
#define BTN_0        45
#define BTN_1        35
#define BTN_2        29
#define BTN_3        28   // FIXED (was 23, conflicted)
#define BTN_4        37
#define BTN_5        31
#define BTN_6        25
#define BTN_7        39
#define BTN_8        33
#define BTN_9        27
#define BTN_CLEAR    32
#define BTN_ENTER    34   // FIXED (was 22, conflicted)
#define BTN_PLUS     49
#define BTN_MINUS    47
#define BTN_RSET     24
#define BTN_KEY_REL  26

// ================== LED Pin Definitions ==================
#define KEY_REL_LED  41
#define OPR_ERR      42

// ================== DSKY State ==================
enum DSKYMode {
  MODE_IDLE,
  MODE_VERB_ENTRY,
  MODE_NOUN_ENTRY,
  MODE_DATA_ENTRY
};

DSKYMode currentMode = MODE_IDLE;
String verbValue = "00";
String nounValue = "00";
String progValue = "00";
String entryBuffer = "";

// Register display values
String reg1 = "+00000";
String reg2 = "+00000"; 
String reg3 = "+00000";

// Data entry state variables
int currentRegister = 0; 
String dataEntryValues[3] = {"+00000", "+00000", "+00000"}; 
bool dataEntryComplete = false; 
bool keyRelActive = false; 
unsigned long blinkTimer = 0; 
bool blinkState = true; 

// Smart update flags
bool screenNeedsUpdate = true; 
bool verbAreaNeedsUpdate = false; 
bool nounAreaNeedsUpdate = false; 
bool progAreaNeedsUpdate = false;
bool registersNeedUpdate = false; 

// Colors
uint16_t greenColor;
uint16_t yellowColor;
uint16_t blackColor;

// ================== Button Pin Array ==================
const int buttonPins[] = {
  BTN_VERB, BTN_NOUN, BTN_PRO,
  BTN_0, BTN_1, BTN_2, BTN_3, BTN_4, BTN_5, BTN_6, BTN_7, BTN_8, BTN_9,
  BTN_CLEAR, BTN_ENTER, BTN_PLUS, BTN_MINUS, BTN_RSET, BTN_KEY_REL
};

// ================== Setup ==================
void setup() {
  Serial.begin(9600);

  uint16_t ID = tft.readID();   // detect LCD controller
  Serial.print("LCD ID: 0x");
  Serial.println(ID, HEX);

  if (ID == 0x0 || ID == 0xFFFF) {
    Serial.println("ERROR: No display detected!");
    while (1);  // stop here
  }

  tft.begin(ID);                
  tft.setRotation(0);           
  
  // Define colors
  greenColor = tft.color565(0, 255, 0);   
  yellowColor = tft.color565(255, 255, 0); 
  blackColor = tft.color565(0, 0, 0);     
  
  randomSeed(analogRead(A0));

  // Init buttons properly
  for (int i = 0; i < sizeof(buttonPins) / sizeof(buttonPins[0]); i++) {
    pinMode(buttonPins[i], INPUT_PULLUP);
  }
  
  // Init LEDs
  pinMode(KEY_REL_LED, OUTPUT);
  digitalWrite(KEY_REL_LED, LOW);
  pinMode(OPR_ERR, OUTPUT);
  digitalWrite(OPR_ERR, LOW);
  
  drawMainDisplay();
}

// ================== DISPLAY FUNCTIONS ==================
void drawMainDisplay() {
  tft.fillScreen(blackColor);    
  
  tft.setTextColor(greenColor);
  tft.setTextSize(3);
  tft.setCursor(10, 20);  tft.print("COMP");
  tft.setCursor(10, 50);  tft.print("ACTY");
  tft.setCursor(160, 20); tft.print("PROG");
  tft.setCursor(10, 100); tft.print("VERB");
  tft.setCursor(160, 100);tft.print("NOUN");

  drawProgArea();
  drawVerbArea();
  drawNounArea();
  drawRegisters();

  screenNeedsUpdate = false;
  verbAreaNeedsUpdate = false;
  nounAreaNeedsUpdate = false;
  progAreaNeedsUpdate = false;
  registersNeedUpdate = false;
}

void drawProgArea() {
  tft.fillRect(180, 50, 100, 32, blackColor);
  tft.setTextSize(4);
  tft.setTextColor(greenColor);
  tft.setCursor(180, 50);
  tft.print(progValue);
}

void drawVerbArea() {
  tft.fillRect(10, 130, 100, 32, blackColor);
  tft.setTextSize(4);
  tft.setCursor(10, 130);
  
  if (currentMode == MODE_VERB_ENTRY) {
    tft.setTextColor(yellowColor);
    if (entryBuffer.length() == 0) tft.print(""); 
    else if (entryBuffer.length() == 1) tft.print(entryBuffer + "_"); 
    else tft.print(entryBuffer); 
  } else {
    tft.setTextColor(greenColor);
    tft.print(verbValue);
  }
}

void drawNounArea() {
  tft.fillRect(160, 130, 100, 32, blackColor);
  tft.setTextSize(4);
  tft.setCursor(160, 130);
  
  if (currentMode == MODE_NOUN_ENTRY) {
    tft.setTextColor(yellowColor);
    if (entryBuffer.length() == 0) tft.print(""); 
    else if (entryBuffer.length() == 1) tft.print(entryBuffer + "_"); 
    else tft.print(entryBuffer); 
  } else {
    tft.setTextColor(greenColor);
    tft.print(nounValue);
  }
}

void drawRegisters() {
  tft.fillRect(80, 190, 200, 120, blackColor);
  tft.setTextSize(4);

  for (int i = 0; i < 3; i++) {
    tft.setCursor(80, 190 + i * 40);
    if (currentMode == MODE_DATA_ENTRY && currentRegister == i) {
      if (blinkState) {
        tft.setTextColor(yellowColor);
        if (entryBuffer.length() > 0) tft.print(entryBuffer);
        else tft.print(dataEntryValues[i]);
      }
    } else {
      tft.setTextColor(greenColor);
      if (currentMode == MODE_DATA_ENTRY && currentRegister > i) {
        tft.print(dataEntryValues[i]);
      } else {
        if (i == 0) tft.print(reg1);
        else if (i == 1) tft.print(reg2);
        else if (i == 2) tft.print(reg3);
      }
    }
  }
}

// ================== INPUT HANDLERS (same as before) ==================
// keep your handleNumberInput(), handlePlusMinusInput(), executeVerbNounCommand(),
// executeEnter(), executeProceed(), resetSystem(), updateBlinking(), loop() 
// exactly as in your version → they work fine with fixed pin mapping
// =====================================================================
