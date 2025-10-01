document.addEventListener("DOMContentLoaded", function () {
  const verbInput = document.getElementById("verb-input");
  const nounInput = document.getElementById("noun-input");

  let tgo = 1200;   // Time to Go in seconds
  let tui = 600;    // Time Until Ignition
  let crd = 45000;  // Crossrange Distance
  let v06Active = false;
  let intervalId = null;

  let v05n09Count = 0;

  let activeInput = null;

  // New variables to track the sequence - modified for VERB first
  let sequenceState = 'initial'; // 'initial', 'verb_entered', 'noun_entered', 'ready_for_pro'
  let pendingVerbValue = '';
  let pendingNounValue = '';

  // Track focused input
  [verbInput, nounInput].forEach(input => {
    input.addEventListener('focus', () => {
      activeInput = input;
    });
  });

  // Mapping of buttons to verb/noun combos for glowing
  const lightConditions = {};

  const keypadButtons = document.querySelectorAll(".new-buttons input[type='button']");

  // Helper function to set all output boxes to +00000
  function setOutputsToZero() {
    const outputs = document.querySelectorAll('input[name="breaking"]');
    outputs.forEach(out => out.value = '+00000');
  }

  // Function to execute the actual VERB/NOUN functionality
  function executeVerbNounFunction(verbVal, nounVal) {
    // Set outputs to +00000 initially
    setOutputsToZero();

    // Small delay to show the +00000 before starting specific functions
    setTimeout(() => {
      // ✨ VERB 37: Copy NOUN → PROG
      if (verbVal === "37") {
        const progInput = document.querySelector('input[name="prog"]');
        if (progInput) {
          progInput.value = nounVal;
        }
        // Don't clear NOUN - only clear on RESET or new VERB/NOUN
      }

      if (verbVal === "06" && nounVal === "61") {
        const outputs = document.querySelectorAll('input[name="breaking"]');
        if (outputs.length >= 3) {
          v06Active = true;

          // Clear any previous interval
          if (intervalId) clearInterval(intervalId);

          // Set initial values
          tgo = 1200;
          tui = 600;
          crd = 45000;

          intervalId = setInterval(() => {
            // Only decrement if TUI > 100
            if (tui > 100) {
              tgo = Math.max(0, tgo - 1);
              tui = Math.max(0, tui - 1);
              crd = Math.max(0, crd - 50); // crossrange decrement
            }

            // Update the 3 boxes
            outputs[0].value = `+${tgo}`;
            outputs[1].value = `+${tui}`;
            outputs[2].value = `+${crd}`;

            // Turn on KEY REL light when TUI ≤ 100
            const keyRelBtn = Array.from(document.querySelectorAll('.logo-section .button-grid input[type="button"]'))
                                  .find(btn => btn.value.replace(/\s+/g,' ').trim() === "KEY REL");
            if (keyRelBtn) {
              if (tui <= 100) keyRelBtn.classList.add("light-on");
              else keyRelBtn.classList.remove("light-on");
            }

          }, 20); // update every second

        }
      }

      if (verbVal === "06" && nounVal === "63") {
          const outputs = document.querySelectorAll('input[name="breaking"]');
          if (outputs.length >= 3) {
              // Initial base values
              let alt = 40000;      // Altitude
              let diff = 1000;      // Difference
              let deltaAlt = -300;  // Change in altitude

              // Clear any previous interval
              if (intervalId) clearInterval(intervalId);

              intervalId = setInterval(() => {
                  // Slightly fluctuate values
                  diff += (Math.random() - 0.5) * 10;     // ±5 fluctuation
                  alt += (Math.random() - 0.5) * 20;      // ±10 fluctuation
                  deltaAlt += (Math.random() - 0.5) * 5;  // ±2.5 fluctuation

                  // Slowly drift values (simulate descent)
                  alt -= 0.5;           // altitude slowly decreasing
                  deltaAlt -= 0.1;      // change in altitude slowly decreasing

                  // Update outputs
                  outputs[0].value = "+" + diff.toFixed(0);
                  outputs[1].value = "+" + alt.toFixed(0);
                  outputs[2].value = deltaAlt >= 0 ? "+" + deltaAlt.toFixed(0) : deltaAlt.toFixed(0);
              }, 100); // update every 100ms
          }
      }

      // Handle V57 with any NOUN (including empty/00 for V57E)
      if (verbVal === "57") {
          // Set PROG to 64 after a short delay
          setTimeout(() => {
              const progInput = document.querySelector('input[name="prog"]');
              if (progInput) progInput.value = "64";

              // Clear the three output boxes if any are running
              const outputs = document.querySelectorAll('input[name="breaking"]');
              outputs.forEach(out => out.value = '');

              // Stop any running interval
              if (intervalId) {
                  clearInterval(intervalId);
                  intervalId = null;
                  v06Active = false;
              }

              // Clear all lights
              clearAllLights();
          }, 2000); // 2 second delay - "No change happen on screen though, After sometime auto changes PROG to 64"
      }

      if (verbVal === "06" && nounVal === "64") {
          const outputs = document.querySelectorAll('input[name="breaking"]');
          if (outputs.length >= 3) {
              // Initial values
              let box1 = 545;    // "+05 45" as integer for easier fluctuation
              let box2 = -30;
              let box3 = 300;

              // Clear any previous interval
              if (intervalId) clearInterval(intervalId);

              intervalId = setInterval(() => {
                  // Slight random fluctuations
                  box1 += (Math.random() - 0.5) * 2;   // ±1
                  box2 += (Math.random() - 0.5) * 1;   // ±0.5
                  box3 += (Math.random() - 0.5) * 2;   // ±1

                  // Slowly decrease last box
                  box3 -= 0.1;

                  // Update the outputs
                  outputs[0].value = "0" + Math.round(box1 / 100) + " " + (Math.round(box1) % 10) + "0"; // "+05 45"
                  outputs[1].value = (box2 >= 0 ? "+" : "") + Math.round(box2);
                  outputs[2].value = (box3 >= 0 ? "+" : "") + Math.round(box3);
              }, 100); // update every 100ms

              // After 5 seconds, update PROG
              setTimeout(() => {
                  const progInput = document.querySelector('input[name="prog"]');
                  if (progInput) progInput.value = "66";
              }, 5000);

            }
      }

      if (verbVal === "16" && nounVal === "68") {
          const outputs = document.querySelectorAll('input[name="breaking"]');
          if (outputs.length >= 3) {
              // Initial values
              let tbrake = 1200;    // Time until braking phase
              let vel = 1000;       // Velocity
              let dist = 30000;     // Distance to landing site

              // Clear any previous interval
              if (intervalId) clearInterval(intervalId);

              intervalId = setInterval(() => {
                  // Slowly decrease time and distance
                  tbrake = Math.max(0, tbrake - 0.5);   // decrement time slowly
                  dist = Math.max(0, dist - 10);        // decrement distance slowly

                  // Velocity fluctuates slightly
                  vel += (Math.random() - 0.5) * 10;   // ±5 fluctuation

                  // Update the outputs
                  outputs[0].value = "+" + Math.round(tbrake);
                  outputs[1].value = "+" + Math.round(vel);
                  outputs[2].value = "+" + Math.round(dist);
              }, 100); // update every 100ms

              // Optional: Stop interval after landing (dist = 0)
              setTimeout(() => {
                  if (intervalId) {
                      clearInterval(intervalId);
                      intervalId = null;
                  }
              }, tbrake * 100); // stop roughly when tbrake reaches 0

              // Light up PROG after 5 seconds
              setTimeout(() => {
                  const progBtn = Array.from(document.querySelectorAll('.logo-section .button-grid input[type="button"]'))
                                        .find(btn => btn.value.replace(/\s+/g,' ').trim() === "PROG");
                  if (progBtn) progBtn.classList.add("light-on");
              }, 3000);

              // Light up RESTART after 6 seconds
              setTimeout(() => {
                  const restartBtn = Array.from(document.querySelectorAll('.logo-section .button-grid input[type="button"]'))
                                          .find(btn => btn.value.replace(/\s+/g,' ').trim() === "RESTART");
                  if (restartBtn) restartBtn.classList.add("light-on");
              }, 4000);
          }
      }

      if (verbVal === "05" && nounVal === "09") {

          const progInput = document.querySelector('input[name="prog"]');
          if (progInput) progInput.value = ""; // keep it blank initially if needed

          const progBtn = Array.from(document.querySelectorAll('.logo-section .button-grid input[type="button"]'))
                                .find(btn => btn.value.replace(/\s+/g,' ').trim() === "PROG");
          if (progBtn) progBtn.classList.add("light-on");

          const restartBtn = Array.from(document.querySelectorAll('.logo-section .button-grid input[type="button"]'))
                                  .find(btn => btn.value.replace(/\s+/g,' ').trim() === "RESTART");
          if (restartBtn) restartBtn.classList.add("light-on");

          if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
              v06Active = false;
          }

          v05n09Count += 1;
          const outputs = document.querySelectorAll('input[name="breaking"]');
          if (outputs.length >= 3) {
              if (v05n09Count === 2) {
                  outputs[0].value = "3 1201"; 
              } else {
                  outputs[0].value = "3 1202"; 
              }  // First box
              outputs[1].value = "";        // Clear second box
              outputs[2].value = "";        // Clear third box
          }

          // After 5 seconds, clear the boxes and turn off lights, keeping PROG = 63
          setTimeout(() => {
              if (progInput) progInput.value = "63";
              if (progBtn) progBtn.classList.remove("light-on");
              if (restartBtn) restartBtn.classList.remove("light-on");

              // REMOVED: Don't clear VERB/NOUN automatically
              // verbInput.value = '';
              // nounInput.value = '';

              // Clear the three output boxes
              const outputs = document.querySelectorAll('input[name="breaking"]');
              outputs.forEach(out => out.value = '');

          }, 5000);
      }

    }, 500); // 500ms delay to show +00000 briefly

    // Handle lights
    const buttons = document.querySelectorAll('.logo-section .button-grid input[type="button"]');
    buttons.forEach(button => {
      const btnValue = button.value.replace(/\s+/g, ' ').trim();
      const condition = lightConditions[btnValue];

      if (condition && condition.verb === verbVal && condition.noun === nounVal) {
        button.classList.add("light-on");
      } else {
        button.classList.remove("light-on");
      }
    });
  }

  keypadButtons.forEach(button => {
    button.addEventListener("click", () => {
      // Animate button press
      button.classList.add("pressed");
      setTimeout(() => button.classList.remove("pressed"), 150);

      // Normalize button value by replacing all whitespace (spaces, newlines) with a single space
      const rawValue = button.value;
      const value = rawValue.replace(/\s+/g, ' ').trim();

      if (value === "VERB") {
        console.log("VERB button pressed - clearing VERB input");
        verbInput.value = ""; // clear previous number
        verbInput.focus();
        activeInput = verbInput;
        return;
      }
      if (value === "NOUN") {
        console.log("NOUN button pressed - clearing NOUN input");
        nounInput.value = ""; // clear previous number
        nounInput.focus();
        activeInput = nounInput;
        return;
      }
      if (!activeInput) return; // no input focused

      // Clear active input
      if (value === "CLR") {
        activeInput.value = '';
        return;
      }

    if (value === "RESET") {
    // Clear VERB, NOUN, PROG
    verbInput.value = '00';
    nounInput.value = '00';
    const progInput = document.querySelector('input[name="prog"]');
    if (progInput) progInput.value = '00';

    // Set the three output boxes to +00000
    setOutputsToZero();

    // Stop any running interval for V06N61
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        v06Active = false;
    }

    // Reset sequence state when VERB is pressed
    sequenceState = 'initial';
    pendingVerbValue = '';
    pendingNounValue = '';

    verbInput.focus();
    activeInput = verbInput;
    verbEntered = false; // Reset verb entered flag
    nounEntered = false; // Reset noun entered flag

    // Clear lights
    clearAllLights();

    return;
}

  if (value === "ENTER") {
    const verbVal = verbInput.value.trim();
    const nounVal = nounInput.value.trim();

    // Handle sequence tracking - modified for VERB first
    if (activeInput === verbInput && verbVal !== '') {
      // VERB was entered first
      pendingVerbValue = verbVal;
      pendingNounValue = nounVal; // Capture current NOUN value (may be empty)
      
      // For V57, we can go straight to ready_for_pro since NOUN is optional
      if (verbVal === '57') {
        sequenceState = 'ready_for_pro';
        console.log('V57 entered - Ready for PRO');
      } else {
        sequenceState = 'verb_entered';
        console.log('VERB entered:', verbVal);
      }
    } else if (activeInput === nounInput && nounVal !== '' && sequenceState === 'verb_entered') {
      // NOUN was entered after VERB
      pendingNounValue = nounVal;
      sequenceState = 'ready_for_pro';
      console.log('NOUN entered after VERB:', nounVal, 'Ready for PRO');
    } else {
      // Original behavior for other cases or when sequence is not followed
      executeVerbNounFunction(verbVal, nounVal);
    }

    activeInput.blur();
    return;
  }

      // Special buttons with custom behavior, no typing
      if (value === "PRO") {
          console.log("PRO button pressed");
          console.log("Current sequence state:", sequenceState);
          console.log("Pending VERB:", pendingVerbValue, "Pending NOUN:", pendingNounValue);
          console.log("Current VERB input:", verbInput.value, "Current NOUN input:", nounInput.value);

          // Check if we're in the correct sequence state
          if (sequenceState === 'ready_for_pro' && pendingVerbValue && pendingNounValue) {
            console.log('✓ Executing function for VERB:', pendingVerbValue, 'NOUN:', pendingNounValue);
            executeVerbNounFunction(pendingVerbValue, pendingNounValue);
            
            // REMOVED: Don't clear the input fields when executing
            // verbInput.value = '';
            // nounInput.value = '';
            
            // Reset sequence state
            sequenceState = 'initial';
            pendingVerbValue = '';
            pendingNounValue = '';
            return;
          }

          // Original PRO button behavior for other cases
          if (verbInput.value === "50" && nounInput.value === "18") {
              setTimeout(() => {
                  verbInput.value = "99";
                  nounInput.value = "62";
              }, 2000); // 5000 ms = 5 seconds
          }

          if (verbInput.value === "99" && nounInput.value === "62") {

            // Don't clear VERB/NOUN here - only clear on RESET or new VERB/NOUN

            // Light up ALT and VEL
            const altBtn = Array.from(document.querySelectorAll('.logo-section .button-grid input[type="button"]'))
                .find(btn => btn.value.replace(/\s+/g, ' ').trim() === "ALT");
            const velBtn = Array.from(document.querySelectorAll('.logo-section .button-grid input[type="button"]'))
                .find(btn => btn.value.replace(/\s+/g, ' ').trim() === "VEL");

            
            setTimeout(() => {
                  if (altBtn) altBtn.classList.add("light-on");
                  if (velBtn) velBtn.classList.add("light-on");

                  setTimeout(() => {
                    if (altBtn) altBtn.classList.remove("light-on");
                    if (velBtn) velBtn.classList.remove("light-on");
                  }, 5000);
            }, 1000);
          }

          return; // stop further processing
      }

      if (value === "KEY REL") {
          // Clear the 3 output boxes
          const outputBoxes = document.querySelectorAll('input[name="breaking"]');
          outputBoxes.forEach(box => box.value = '');

          // Stop the V06N61 interval if it exists
          if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
              v06Active = false;
          }

          // Optionally, turn off the KEY REL light
          const keyRelBtn = Array.from(document.querySelectorAll('.logo-section .button-grid input[type="button"]'))
                                .find(btn => btn.value.replace(/\s+/g,' ').trim() === "KEY REL");
          if (keyRelBtn) keyRelBtn.classList.remove("light-on");

              const verbInput = document.getElementById("verb-input");
              const nounInput = document.getElementById("noun-input");
              verbInput.value = "50";
              nounInput.value = "18";
              return;
      }

      // Default: Insert button value text at cursor in active input
      insertAtCursor(activeInput, value);
    });
  });

  // Helper function: Insert text at cursor position in input/textarea
  function insertAtCursor(input, text) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const currentValue = input.value;

    input.value = currentValue.substring(0, start) + text + currentValue.substring(end);
    input.selectionStart = input.selectionEnd = start + text.length;
    input.focus();
  }

  // Helper to clear all lights on logo buttons
  function clearAllLights() {
    const buttons = document.querySelectorAll('.logo-section .button-grid input[type="button"]');
    buttons.forEach(button => button.classList.remove("light-on"));
  }
});