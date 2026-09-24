// The runner checks observable DOM state, never a particular spelling of a solution.
const text = (selector, value) => ({ type: "text", selector, value });
const count = (selector, value) => ({ type: "count", selector, value });
const css = (selector, property, value) => ({
  type: "css",
  selector,
  property,
  value,
});
const hasClass = (selector, value, present = true) => ({
  type: "class",
  selector,
  value,
  present,
});
const attribute = (selector, name, value) => ({
  type: "attribute",
  selector,
  name,
  value,
});
const visible = (selector, value) => ({ type: "visible", selector, value });
const click = (selector) => ({ type: "click", selector });
const check = (...assertions) => ({ type: "check", assertions });
const value = (selector, value) => ({ type: "value", selector, value });
const event = (selector, name, key) => ({ type: "event", selector, name, key });
const test = (label, assertions, options = {}) => ({
  label,
  assertions,
  ...options,
});

export const lessons = [
  {
    id: 0,
    title: "Wake the beacon",
    chapter: "First light",
    concept: "Libraries, ID selectors & .text()",
    description:
      "The island beacon has been asleep for years. Send it a small, very specific wake-up call. Leave the camp sign exactly where it is.",
    objectives: [
      "Change the text of #beacon from Sleeping to Awake.",
      "Keep the text of #sign as Camp.",
    ],
    explanation:
      'A library is a collection of reusable code. jQuery is a JavaScript library for working with HTML, styles, and events. A normal website must import it before using it; this workshop already loads real jQuery for you. $ is the jQuery function. $("#beacon") selects the element with id="beacon", and .text("Awake") replaces its text. Put your JavaScript here, without script tags.',
    starter:
      '// Select the beacon and give it a new message.\n$("#beacon").text( );',
    html: '<section><h2 id="beacon">Sleeping</h2><p id="sign">Camp</p></section>',
    hints: [
      "An ID selector starts with #. Use #beacon, not beacon.",
      "A word passed to .text() must be a quoted string.",
      'Try $("#beacon").text("Awake");',
    ],
    solution: '$("#beacon").text("Awake");',
    reward: 100,
    source:
      "Lecture: jQuery — slides 3–9, What is a library?, jQuery Syntax, and Code Along",
    tests: [
      test("The beacon reads Awake", [text("#beacon", "Awake")]),
      test("The camp sign stays untouched", [
        count("#beacon", 1),
        text("#sign", "Camp"),
      ]),
    ],
  },
  {
    id: 1,
    title: "Bring the grove to life",
    chapter: "First light",
    concept: "Class selectors & groups",
    description:
      "Three seedlings share the same patch of island soil. Wake the whole grove with one selection, without disturbing the ancient tree.",
    objectives: [
      "Give every .seedling the text Growing.",
      "Keep #old-tree reading Ancient oak and keep all three seedlings.",
    ],
    explanation:
      'An ID names one element; a class can be shared by many. $(".seedling") finds every element with class="seedling". Calling .text() on that collection changes every matching element. A leading dot means class, while a leading # means ID.',
    starter:
      '// A dot selects a class shared by several elements.\n$(".seedling").text("");',
    html: '<section><h2>The quiet grove</h2><p class="seedling">Dormant</p><p class="seedling">Dormant</p><p class="seedling">Dormant</p><p id="old-tree">Ancient oak</p></section>',
    hints: [
      "Select .seedling, including the dot.",
      'The same .text("Growing") call can update all three seedlings.',
      "Selecting every p would also change the old tree. Narrow your selection.",
    ],
    solution: '$(".seedling").text("Growing");',
    reward: 100,
    source:
      "Lecture: jQuery — slides 9 and 15, selectors and jQuery: Element Access",
    tests: [
      test("All three seedlings are growing", [
        count(".seedling", 3),
        text(".seedling", "Growing"),
      ]),
      test("The ancient tree is protected", [text("#old-tree", "Ancient oak")]),
    ],
  },
  {
    id: 2,
    title: "Color the tide pools",
    chapter: "First light",
    concept: "Changing CSS properties",
    description:
      "The tide pools have lost their color. Give the water a blue shimmer and light the coral orange, but keep the nearby sand dry.",
    objectives: [
      "Set background-color to blue on both .pool elements.",
      "Set the text color of #coral to orange.",
      "Keep the background-color of #sand tan.",
    ],
    explanation:
      '.css("property", "value") changes a CSS property on the selected elements. CSS properties such as background-color are written as strings. You can use named colors like blue, orange, and tan. The browser may report those colors as rgb values; they still describe the same colors.',
    starter:
      '// Give the pools their blue water back.\n$(".pool").css("background-color", "gray");\n// Then change the coral text color.',
    html: '<section><h2>Tide pools</h2><p class="pool" style="background-color:gray;padding:10px">North pool</p><p class="pool" style="background-color:gray;padding:10px">South pool</p><p id="coral" style="color:gray">Coral</p><p id="sand" style="background-color:tan;padding:10px">Dry sand</p></section>',
    hints: [
      'Use .css("background-color", "blue") for the pools.',
      "The coral needs the color property, not background-color.",
      "Make two selections: .pool and #coral.",
    ],
    solution:
      '$(".pool").css("background-color", "blue");\n$("#coral").css("color", "orange");',
    reward: 100,
    source:
      "Lecture: jQuery — slides 6, 9, 24, and 26, .css() and jQuery Reference",
    tests: [
      test("Both pools turn blue", [
        count(".pool", 2),
        css(".pool", "background-color", "rgb(0, 0, 255)"),
      ]),
      test("The coral glows orange", [
        css("#coral", "color", "rgb(255, 165, 0)"),
      ]),
      test("The sand stays dry", [
        css("#sand", "background-color", "rgb(210, 180, 140)"),
      ]),
    ],
  },
  {
    id: 3,
    title: "Mend the mossy bridge",
    chapter: "A living island",
    concept: "Adding & removing classes",
    description:
      "The bridge is still marked broken. Remove that warning, mark it repaired, and preserve the stonework that has held it together.",
    objectives: [
      "Remove the broken class from #bridge.",
      "Add the repaired class to #bridge while keeping its stone class.",
      "Leave the warning sign marked caution.",
    ],
    explanation:
      'Classes can describe state as well as appearance. .removeClass("broken") removes just that class, and .addClass("repaired") adds a new one without replacing other classes. Do not include a dot in these method arguments: the dot belongs in a selector, not in a class name.',
    starter:
      '// Change only the bridge’s state classes.\n$("#bridge").removeClass("");\n$("#bridge").addClass("");',
    html: '<section><h2 id="bridge" class="stone broken">Mossy bridge</h2><p id="warning" class="caution">Watch your step</p></section>',
    hints: [
      "The selector is #bridge, and the class name is broken without a dot.",
      "Remove broken, then add repaired.",
      "Do not overwrite the complete class attribute: stone must survive.",
    ],
    solution:
      '$("#bridge").removeClass("broken");\n$("#bridge").addClass("repaired");',
    reward: 100,
    source:
      "Lecture: jQuery — slides 9, 24, and 26, .addClass() and .removeClass()",
    tests: [
      test("The bridge is repaired, not broken", [
        hasClass("#bridge", "repaired"),
        hasClass("#bridge", "broken", false),
      ]),
      test("The original stonework and warning remain", [
        hasClass("#bridge", "stone"),
        hasClass("#warning", "caution"),
        text("#warning", "Watch your step"),
      ]),
    ],
  },
  {
    id: 4,
    title: "Lift the harbor fog",
    chapter: "A living island",
    concept: ".hide() & .show()",
    description:
      "Fog covers the harbor and a hidden ferry waits beneath it. Clear both fog banks and reveal the boat without removing anything from the island.",
    objectives: [
      "Hide both .fog elements.",
      "Show the initially hidden #ferry.",
      "Keep the fog elements in the DOM and keep #lighthouse visible.",
    ],
    explanation:
      ".hide() sets an element’s display so it disappears, but the element still exists in the document. .show() restores it. This is useful when you want to reveal or conceal something again later. Removing an element is a different operation.",
    starter:
      '// Hide the fog, then reveal the ferry.\n$(".fog").hide();\n// Your ferry selection goes here.',
    html: '<section><h2 id="lighthouse">Harbor light</h2><p class="fog">Fog over the water</p><p class="fog">Fog over the pier</p><p id="ferry" style="display:none">The ferry is ready</p></section>',
    hints: [
      "Use a class selector for the two fog banks.",
      'Use $("#ferry").show() to reveal the boat.',
      "Do not use .remove() or .empty(): the fog must still exist.",
    ],
    solution: '$(".fog").hide();\n$("#ferry").show();',
    reward: 100,
    source:
      "Lecture: jQuery — slides 5, 13, and 15, .hide(), .show(), and Element Access",
    tests: [
      test("Both fog banks are hidden, not deleted", [
        count(".fog", 2),
        visible(".fog", false),
      ]),
      test("The ferry and harbor light are visible", [
        visible("#ferry", true),
        visible("#lighthouse", true),
        text("#ferry", "The ferry is ready"),
      ]),
    ],
  },
  {
    id: 5,
    title: "Plant a crystal marker",
    chapter: "A living island",
    concept: "Creating, appending & attributes",
    description:
      "The trail needs a marker pointing toward the crystal cove. Build a new sign inside the trail container and keep the welcome sign beside it.",
    objectives: [
      "Create exactly one p element with id crystal-marker inside #trail.",
      'Give it the text Crystal Cove and the attribute data-direction="east".',
      "Preserve the existing #welcome sign.",
    ],
    explanation:
      '$("p") selects existing paragraphs; $("<p>") creates a new paragraph. A new element is not visible until it is inserted into the document. .attr("id", "crystal-marker") sets an attribute, .text() sets its words, and .appendTo("#trail") places it inside the trail container.',
    starter:
      '// Angle brackets create a new element.\nconst $marker = $("<p>");\n// Set its id, text, and data-direction, then append it to #trail.',
    html: '<section><h2>Trailhead</h2><div id="trail"><p id="welcome">Welcome, explorer</p></div></section>',
    hints: [
      "Save the new element in $marker so you can keep working on it.",
      "Set two attributes: id to crystal-marker and data-direction to east.",
      'Finish with $marker.appendTo("#trail");',
    ],
    solution:
      'const $marker = $("<p>");\n$marker.attr("id", "crystal-marker");\n$marker.attr("data-direction", "east");\n$marker.text("Crystal Cove");\n$marker.appendTo("#trail");',
    reward: 100,
    source:
      "Lecture: jQuery — slides 14, 21, 24–26, Element Creation and jQuery Reference",
    tests: [
      test("A new paragraph marks the trail", [
        count("#crystal-marker", 1),
        count("#trail > p#crystal-marker", 1),
        text("#crystal-marker", "Crystal Cove"),
      ]),
      test("The marker points east and the welcome sign survives", [
        attribute("#crystal-marker", "data-direction", "east"),
        text("#trail > #welcome", "Welcome, explorer"),
      ]),
    ],
  },
  {
    id: 6,
    title: "Rescue the last sapling",
    chapter: "Tools of the trade",
    concept: ".empty(), .detach() & moving nodes",
    description:
      "A healthy sapling is trapped among the ruins. Move the original plant into the nursery before clearing the rubble. A copy is not the same living tree.",
    objectives: [
      "Move the original #sapling from #ruins into #nursery.",
      "Empty #ruins completely, but keep the ruins container itself.",
      "Preserve the sapling’s healthy class and text.",
    ],
    explanation:
      ".detach() takes an element out of the document while keeping the same element available to reuse. Save the result, clear the old container with .empty(), and append the saved element to its new home. .empty() removes the contents of a container, not the container itself. Detach the sapling before emptying the ruins.",
    starter:
      '// Rescue first; clear the ruins second.\nconst $sapling = $("#sapling");\n// Detach it, empty #ruins, and move it into #nursery.',
    html: '<section><h2>The old ruins</h2><div id="ruins"><p class="rubble">Fallen stones</p><p id="sapling" class="healthy">Last sapling</p><p class="rubble">Broken branches</p></div><div id="nursery"></div></section>',
    hints: [
      'Save $("#sapling").detach() in a variable before clearing its old home.',
      '$("#ruins").empty() clears all remaining content.',
      "Append the saved sapling into #nursery; do not create a new paragraph.",
    ],
    solution:
      'const $sapling = $("#sapling").detach();\n$("#ruins").empty();\n$sapling.appendTo("#nursery");',
    reward: 100,
    source:
      "Lecture: jQuery — slides 9, 23, and 26, cached jQueries, .empty(), and .detach()",
    tests: [
      test(
        "The original sapling reaches the nursery",
        [
          {
            type: "sameNode",
            selector: "#nursery > #sapling",
            original: "#sapling",
          },
          count("#sapling", 1),
        ],
        { remember: ["#sapling"] },
      ),
      test("The ruins are empty and the rescued tree is healthy", [
        count("#ruins", 1),
        count("#ruins > *", 0),
        text("#ruins", ""),
        hasClass("#nursery > #sapling", "healthy"),
        text("#sapling", "Last sapling"),
      ]),
    ],
  },
  {
    id: 7,
    title: "Restore the lookout",
    chapter: "Tools of the trade",
    concept: "Chaining & cached selections",
    description:
      "The lookout needs a whole restoration, not just a fresh coat of paint. Keep one reference to it and give it its identity, color, and purpose again.",
    objectives: [
      "Set #lookout text to Ready and add its restored class.",
      "Set its text color to limegreen and title attribute to Northern lookout.",
      "Keep the lookout’s tower class and leave the dock untouched.",
    ],
    explanation:
      'Most jQuery setters return the selected collection, so you can chain them: $tower.text("Ready").addClass("restored"). Save a selection in a variable to avoid looking up the same element repeatedly. The $ at the start of $tower is a naming convention, not special JavaScript syntax. The checks care about the restored world, not whether you choose a chain or separate statements.',
    starter:
      '// Cache the selection, then build a chain of changes.\nconst $tower = $("#lookout");\n$tower.text("Ready");',
    html: '<section><h2 id="lookout" class="tower" title="Abandoned" style="color:gray">Silent</h2><p id="dock" title="South landing">Dock</p></section>',
    hints: [
      'Continue the chain with .addClass("restored").',
      'Use .css("color", "limegreen") and .attr("title", "Northern lookout").',
      "Put the semicolon at the end of a chain, not between its methods.",
    ],
    solution:
      'const $tower = $("#lookout");\n$tower\n  .text("Ready")\n  .addClass("restored")\n  .css("color", "limegreen")\n  .attr("title", "Northern lookout");',
    reward: 100,
    source:
      "Lecture: jQuery — slides 22–24, Some jQuery Tricks: chaining, cached selections, and attributes",
    tests: [
      test("The lookout is ready and restored", [
        text("#lookout", "Ready"),
        hasClass("#lookout", "restored"),
        hasClass("#lookout", "tower"),
      ]),
      test("The lookout has its color and title", [
        css("#lookout", "color", "rgb(50, 205, 50)"),
        attribute("#lookout", "title", "Northern lookout"),
      ]),
      test("The dock keeps its identity", [
        text("#dock", "Dock"),
        attribute("#dock", "title", "South landing"),
      ]),
    ],
  },
  {
    id: 8,
    title: "Open the garden gate",
    chapter: "An island that responds",
    concept: "Click events & function references",
    description:
      "Give the garden gate a working switch. It must stay closed until someone clicks, then alternate between open and closed on every click.",
    objectives: [
      "Keep #gate reading Closed until #gate-switch is clicked.",
      "Make each click alternate #gate between Open and Closed.",
      "Register the function itself as the handler; do not call it while registering.",
    ],
    explanation:
      'An event handler is a function saved for later. .on("click", toggleGate) tells jQuery to call toggleGate when a click happens. Writing toggleGate() calls it immediately and passes its return value instead. Inside your handler, .text() with no argument reads the current text; an if/else can choose the next state.',
    starter:
      'function toggleGate() {\n  // Read the gate text and choose its opposite state.\n}\n\n// Pass the function, without calling it.\n$("#gate-switch").on("click", toggleGate);',
    html: '<section><h2>Garden gate</h2><p id="gate">Closed</p><button id="gate-switch" type="button">Toggle gate</button><p id="garden">Seeds are safe</p></section>',
    hints: [
      'Read $("#gate").text() inside the function.',
      "If it equals Closed, set Open. Otherwise set Closed.",
      'Use .on("click", toggleGate), not .on("click", toggleGate()).',
    ],
    solution:
      'function toggleGate() {\n  if ($("#gate").text() === "Closed") {\n    $("#gate").text("Open");\n  } else {\n    $("#gate").text("Closed");\n  }\n}\n\n$("#gate-switch").on("click", toggleGate);',
    reward: 100,
    source:
      "Lecture: jQuery — slides 5 and 16–20, jQuery Events and Event Handler Functions: No ()!",
    tests: [
      test("The gate waits for a click", [
        text("#gate", "Closed"),
        text("#garden", "Seeds are safe"),
      ]),
      test("The first click opens the gate", [text("#gate", "Open")], {
        steps: [click("#gate-switch")],
      }),
      test(
        "Repeated clicks keep toggling",
        [text("#gate", "Open"), text("#garden", "Seeds are safe")],
        {
          steps: [
            click("#gate-switch"),
            check(text("#gate", "Open")),
            click("#gate-switch"),
            check(text("#gate", "Closed")),
            click("#gate-switch"),
          ],
        },
      ),
    ],
  },
  {
    id: 9,
    title: "Consult the wishing coin",
    chapter: "An island that responds",
    concept: "Random branches & click handlers",
    description:
      "The wishing well answers with a coin toss. Flip only when asked, use both sides of chance, and count every wish made at the well.",
    objectives: [
      "Leave #coin as Ready and #flip-count as 0 before the first click.",
      "On each #flip click, show Heads if Math.random() > 0.5; otherwise show Tails.",
      "Increase #flip-count by exactly one on every click, including repeated flips.",
    ],
    explanation:
      "Math.random() returns a number from 0 up to, but not including, 1. The lecture’s coin uses an if/else with a 0.5 boundary. Put the random draw inside the click handler so every click gets a new result. A number variable declared outside the handler remembers the count between clicks. The workshop supplies predictable random values during checks so both branches can be verified fairly.",
    starter:
      'let flips = 0;\n\nfunction flipCoin() {\n  // Draw a random number here, then show Heads or Tails.\n  // Increase flips and update #flip-count.\n}\n\n$("#flip").on("click", flipCoin);',
    html: '<section><h2>Wishing well</h2><p id="coin">Ready</p><p>Wishes: <span id="flip-count">0</span></p><button id="flip" type="button">Flip a coin</button></section>',
    hints: [
      "Use if (Math.random() > 0.5) inside flipCoin.",
      "Set #coin to Heads in the if branch and Tails in the else branch.",
      'After either branch, write flips += 1; and $("#flip-count").text(flips);',
    ],
    solution:
      'let flips = 0;\n\nfunction flipCoin() {\n  if (Math.random() > 0.5) {\n    $("#coin").text("Heads");\n  } else {\n    $("#coin").text("Tails");\n  }\n  flips += 1;\n  $("#flip-count").text(flips);\n}\n\n$("#flip").on("click", flipCoin);',
    reward: 100,
    source:
      "Lecture: jQuery — slides 10–11 and 18–20, coin flip challenge and event handler references",
    tests: [
      test("No coin is flipped before a click", [
        text("#coin", "Ready"),
        text("#flip-count", "0"),
      ]),
      test(
        "A high draw produces Heads",
        [text("#coin", "Heads"), text("#flip-count", "1")],
        { random: [0.9], steps: [click("#flip")] },
      ),
      test(
        "A low draw produces Tails",
        [text("#coin", "Tails"), text("#flip-count", "1")],
        { random: [0.1], steps: [click("#flip")] },
      ),
      test("Exactly 0.5 belongs to Tails", [text("#coin", "Tails")], {
        random: [0.5],
        steps: [click("#flip")],
      }),
      test(
        "Every click draws again and is counted",
        [text("#coin", "Heads"), text("#flip-count", "3")],
        {
          random: [0.9, 0.1, 0.8],
          steps: [
            click("#flip"),
            check(text("#coin", "Heads"), text("#flip-count", "1")),
            click("#flip"),
            check(text("#coin", "Tails"), text("#flip-count", "2")),
            click("#flip"),
          ],
        },
      ),
    ],
  },
  {
    id: 10,
    title: "Name your voyage",
    chapter: "An island that responds",
    concept: "Keyboard & change events",
    description:
      "A restored island deserves a named ship. Keep the painted name in sync with typing and let the crew choose a sail color from the rigging controls.",
    objectives: [
      "On keyup in #ship-name, copy its current value into #name-preview.",
      "On change of #sail-color, set #sail text color to the selected value.",
      "Respond to repeated events; do not update the preview before the corresponding event.",
    ],
    explanation:
      'Events are not limited to clicks. keyup fires when a key is released; change reports a committed form selection. .val() reads an input or select value, while .text() updates ordinary visible text. Read the value inside the handler so it is fresh for every event. .on("keyup", handler) and .on("change", handler) use the same function-reference pattern as click.',
    starter:
      'function paintName() {\n  // Read #ship-name with .val(), then update #name-preview.\n}\n\nfunction paintSail() {\n  // Read #sail-color, then change the color of #sail.\n}\n\n$("#ship-name").on("keyup", paintName);\n$("#sail-color").on("change", paintSail);',
    html: '<section><h2>Shipwright’s dock</h2><label>Ship name <input id="ship-name" value="Seabird"></label><p id="name-preview">Seabird</p><label>Sail color <select id="sail-color"><option value="blue">Blue</option><option value="green">Green</option><option value="gold">Gold</option></select></label><p id="sail" style="color:blue">Set sail</p></section>',
    hints: [
      'Inside paintName, use $("#name-preview").text($("#ship-name").val());',
      'Inside paintSail, use .css("color", $("#sail-color").val()).',
      "Keep both .on() calls outside the handler functions so each is registered only once.",
    ],
    solution:
      'function paintName() {\n  $("#name-preview").text($("#ship-name").val());\n}\n\nfunction paintSail() {\n  $("#sail").css("color", $("#sail-color").val());\n}\n\n$("#ship-name").on("keyup", paintName);\n$("#sail-color").on("change", paintSail);',
    reward: 100,
    source:
      "Lecture: jQuery — slides 16–17 and 26, keyboard events, form events, and event registration",
    tests: [
      test(
        "The name changes only when keyup arrives",
        [text("#name-preview", "Moonwake")],
        {
          steps: [
            value("#ship-name", "Moonwake"),
            check(text("#name-preview", "Seabird")),
            event("#ship-name", "keyup", "e"),
          ],
        },
      ),
      test(
        "Later typing replaces the old name, including clearing it",
        [text("#name-preview", "")],
        {
          steps: [
            value("#ship-name", "Coral Runner"),
            event("#ship-name", "keyup", "r"),
            check(text("#name-preview", "Coral Runner")),
            value("#ship-name", ""),
            event("#ship-name", "keyup", "Backspace"),
          ],
        },
      ),
      test(
        "A change event paints the sail green",
        [css("#sail", "color", "rgb(0, 128, 0)")],
        {
          steps: [
            value("#sail-color", "green"),
            check(css("#sail", "color", "rgb(0, 0, 255)")),
            event("#sail-color", "change"),
          ],
        },
      ),
      test(
        "Repeated color choices remain interactive",
        [
          css("#sail", "color", "rgb(255, 215, 0)"),
          text("#name-preview", "Seabird"),
        ],
        {
          steps: [
            value("#sail-color", "green"),
            event("#sail-color", "change"),
            check(css("#sail", "color", "rgb(0, 128, 0)")),
            value("#sail-color", "gold"),
            event("#sail-color", "change"),
          ],
        },
      ),
    ],
  },
  {
    id: 11,
    title: "Roll for the horizon",
    chapter: "The final expedition",
    concept: "Build an interactive dice app",
    description:
      "The entire island is ready for its next adventure. Build the expedition’s six-sided die: every roll must be possible, every click must work, and the log must remember how far you have come.",
    objectives: [
      "Keep #die as Ready and #roll-count as 0 until #roll is clicked.",
      "On every click, show a whole number from 1 through 6 in #die using a fresh Math.random() draw.",
      "Use six equal ranges: Math.floor(Math.random() * 6) + 1.",
      "Increase #roll-count once per click and keep the expedition note unchanged.",
    ],
    explanation:
      "Combine selection, setters, variables, functions, and events into a complete little app. Multiplying Math.random() by 6 gives a value from 0 up to 6. Math.floor rounds down to 0–5; adding 1 makes the six outcomes 1–6. Calculate inside the handler, and keep the roll counter outside it. The checks visit all six ranges and then roll several times in a row. Equivalent working implementations are welcome.",
    starter:
      'let rolls = 0;\nconst $die = $("#die");\nconst $count = $("#roll-count");\n\nfunction rollDie() {\n  // Turn a fresh random number into an integer from 1 to 6.\n  // Display it, increase rolls, and update the counter.\n}\n\n$("#roll").on("click", rollDie);',
    html: '<section><h2>Expedition dice</h2><p id="die">Ready</p><p>Rolls: <span id="roll-count">0</span></p><button id="roll" type="button">Roll the die</button><p id="expedition-note">The horizon is yours</p></section>',
    hints: [
      "The die value is Math.floor(Math.random() * 6) + 1.",
      "Inside rollDie, set $die.text(result), increase rolls, then set $count.text(rolls).",
      "Register rollDie without parentheses. Draw again inside the function, not once at the top of your program.",
    ],
    solution:
      'let rolls = 0;\nconst $die = $("#die");\nconst $count = $("#roll-count");\n\nfunction rollDie() {\n  const result = Math.floor(Math.random() * 6) + 1;\n  $die.text(result);\n  rolls += 1;\n  $count.text(rolls);\n}\n\n$("#roll").on("click", rollDie);',
    reward: 100,
    source:
      "Lecture: jQuery — slides 16–24 and 28, events, refactoring, and jQuery Mini Project: Dice App",
    tests: [
      test("The die waits for its first roll", [
        text("#die", "Ready"),
        text("#roll-count", "0"),
      ]),
      ...[0, 0.2, 0.4, 0.6, 0.8, 0.999999].map((draw, index) =>
        test(
          `Face ${index + 1} can be rolled`,
          [
            text("#die", String(index + 1)),
            text("#roll-count", "1"),
            text("#expedition-note", "The horizon is yours"),
          ],
          { random: [draw], steps: [click("#roll")] },
        ),
      ),
      test(
        "Repeated rolls draw fresh values and keep count",
        [
          text("#die", "3"),
          text("#roll-count", "3"),
          text("#expedition-note", "The horizon is yours"),
        ],
        {
          random: [0, 0.999999, 0.4],
          steps: [
            click("#roll"),
            check(text("#die", "1"), text("#roll-count", "1")),
            click("#roll"),
            check(text("#die", "6"), text("#roll-count", "2")),
            click("#roll"),
          ],
        },
      ),
    ],
  },
];
