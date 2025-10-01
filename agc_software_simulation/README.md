# Apollo Guidance Computer Simulation – Landing Sequence (P63–P66)

This simulation demonstrates the Apollo Guidance Computer (AGC) landing program, broken into three main animations: **Stationary**, **Tilting**, and **Thrusting**.  

---

## 1. Stationary Animation

1. **V37N63E** – Load landing program 63  
   - `63` appears on the PROG display  

2. **V06N61E** – Show landing information  
   - Displays:  
     - Time to go in braking phase  
     - Time until ignition  
     - Cross-range distance  

3. When **time until ignition = 100**, the **KEY REL** light turns on  
   - **KEY REL** → View computer message  

4. **V50N18** – Computer asks permission to turn the rocket sideways  
   - **PRO** → Proceed (give permission)  

5. **5s before ignition** → Display shows **V99N62**  
   - Asks: *“Do you want to land on the Moon?”*  

---

## 2. Tilting Animation

1. **PRO** – Give permission to land  
2. **VEL** and **ALT** lights turn on  
3. After some time, when altitude is correct, both **VEL** and **ALT** lights turn off  

---

## 3. Thrusting Animation

1. **V06N63E** – Show difference between accurate data and measured data  
   - Displays:  
     - Altitude discrepancy  
     - Altitude  
     - Change in altitude  

2. **V57E** – Incorporate merging high-accuracy data with IMU readings  
   - No visible change on screen  

3. Thrust set to **54%**  

4. After some time, program automatically changes **PROG** to `64`  

---
## 4. Changing Altitude Animation

1. **V06N64E** – Show landing coordinates  
   - Displays:  
     - Landing point designator  
     - Change in altitude  
     - Altitude  
2. Program automatically changes **PROG** to `66` after 5 seconds  

---

## 5. Landing Animation – Error Simulation

**Note:** 5 total errors simulated during P63.  

### Step-by-step:

1. **V37N63E** – Load P63  
   - `63` appears on the PROG display  

2. **V16N68E** – Show additional landing info  
   - Displays:  
     - Time until braking phase  
     - Velocity  
     - Distance to landing site  
   - After 3s → **PROG** light turns on  
   - After 5s → **RESTART** light turns on  

3. **V05N09** – Show program alarms  
   - Displays **3 1202** error  
   - After 5s, computer restarts automatically and resumes at **PROG 63**  

4. Repeat Step 2 and 3  
   - Shows **3 1201** error  

5. Repeat Step 4  
   - Shows **3 1202** error  

**Additional Notes:**  
- Two more similar **1202 / 1201 errors** occurred during P64 due to heavy load (not simulated here)  
- Errors stopped during P66 after load reduction  

---
*Part of the Apollo Guidance Computer Exhibit – EngEX 2025 (75th Anniversary, Faculty of Engineering, University of Peradeniya)*  

