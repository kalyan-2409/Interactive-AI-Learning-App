import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;

// Fail-safe initialization: helper to lazily obtain Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables. Gemini features will run in mock mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
     });
  }
  return aiClient;
}

// 1. Reusable High-Fidelity Local Science Fallback Explanations
function getLocalFallbackExplanation(subject: string, topic: string, parameters: any, simplicity: string) {
  const sub = (subject || '').toLowerCase();
  const top = (topic || '').toLowerCase();
  const simp = simplicity || 'student';

  const isKids = simp === 'kids';
  const isExpert = simp === 'expert';

  let coreExplanation = "";
  let mechanics: string[] = [];
  let analogy = "";
  let experimentTip = "";

  if (sub.includes('biol') || sub.includes('cell')) {
    if (top.includes('mitochon')) {
      if (isKids) {
        coreExplanation = "Meet the cell's tiny power plants! 🔋 Mitochondria take the food you eat and turn it into super-charged energy sparks so you can run, jump, and play all day!";
        mechanics = [
          "They act like tiny ovens that burn food fuel.",
          "They make special energy batteries called ATP.",
          "They float around in the cell cytoplasm where energy is needed most!"
        ];
        analogy = "It's like the rechargeable battery inside a fun toy car!";
        experimentTip = "Try adding more molecules in the transport system and see how the energy generators respond!";
      } else if (isExpert) {
        coreExplanation = "The mitochondria are double-membrane-bound organelles primarily responsible for the synthesis of adenosine triphosphate (ATP) via oxidative phosphorylation and the electron transport chain (ETC).";
        mechanics = [
          "The inner membrane invaginates to form cristae, significantly maximizing the surface physical area for respiratory protein complexes.",
          "An electrochemical proton gradient is generated across the intermembrane space, driving ATP Synthase rotors.",
          "They play key roles in cellular signaling, apoptosis, calcium regulation, and metabolic homeostasis."
        ];
        analogy = "They function like a hydroelectric dam, where a chemical proton gradient (water) flows through ATP Synthase turbines to create electricity (ATP).";
        experimentTip = "Observe the passive and active ion transport pumps to see how proton gradients resemble membrane channels.";
      } else {
        coreExplanation = "Mitochondria are the famous 'powerhouses of the cell.' They are responsible for cellular respiration, taking nutrients and converting them into ATP, the cell's energetic currency.";
        mechanics = [
          "They take in glucose and oxygen to start cellular respiration.",
          "They convert ADP into charged ATP packages in their inner chambers.",
          "They supply cellular energy for everything from muscle contractions to brain signals."
        ];
        analogy = "They are like the municipal power station of a bustling city, converting raw fuel into electricity.";
        experimentTip = "Switch to Active Transport mode to see how mitochondria-fueled ATP powers the sodium-glucose pumps!";
      }
    } else if (top.includes('nucleu')) {
      if (isKids) {
        coreExplanation = "The nucleus is the master control tower! 🏰 It contains a very long, secret instruction book called DNA that tells the cell exactly how to grow and what to do!";
        mechanics = [
          "It acts like a locked library containing recipe files.",
          "It sends messages through small windows called pores.",
          "It keeps the master DNA instructions safe from getting damaged."
        ];
        analogy = "It's like the king sitting in a secure castle, sending out royal scrolls of instructions!";
        experimentTip = "Observe the structural border of the nuclear envelope in the cell visual model to see where pores reside!";
      } else if (isExpert) {
        coreExplanation = "The cell nucleus serves as the repository of genomic DNA and acts as the transcription and replication control center of eukaryotic cells.";
        mechanics = [
          "It is bounded by a double-lipid bilayer (the nuclear envelope) integrated with selective nuclear pore complexes.",
          "Chromatin organization fluctuates between transcriptionally active euchromatin and dense inactive heterochromatin.",
          "Transcription factors cross the nuclear membrane to coordinate RNA polymerase activities."
        ];
        analogy = "It functions like an ultra-secure reference library where fragile master blueprints cannot leave, so copy transcripts (mRNA) are printed for export.";
        experimentTip = "Identify the nucleolus core in the simulation diagram and discuss ribosomal RNA assembly pathways.";
      } else {
        coreExplanation = "The nucleus is the cell's 'brain' or directory. It houses the coordinate DNA instructions which regulate all activities, growth, and replication cycles.";
        mechanics = [
          "It holds the master copy of DNA codes.",
          "It controls what proteins are synthesized by issuing mRNA signals.",
          "It isolates genetic materials inside a secure membrane wall."
        ];
        analogy = "It's like the central headquarters or mayor's office of a city, controlling operations via master files.";
        experimentTip = "Look at the central nuclear sphere to see where the genetic storage blueprint is protected from cytoplasm reactions.";
      }
    } else if (top.includes('plasma') || top.includes('membrane') || top.includes('transport') || top.includes('barrier')) {
      if (isKids) {
        coreExplanation = "The cell membrane is like a smart bubble shield! 🧼 It surrounds the cell, keeping the good things inside and blocking the bad things from coming in.";
        mechanics = [
          "It has a dual-layer wall made of tiny oily bubbles.",
          "It opens special doors to let friendly nutrients enter.",
          "It keeps cellular materials safe from drifting away."
        ];
        analogy = "It's like a friendly bouncer at a club, letting in nice friends while keeping troublemakers outside!";
        experimentTip = "Try turning on 'Passive' mode to watch molecules drift across the channels without using any energy!";
      } else if (isExpert) {
        coreExplanation = "The plasma membrane is a selectively permeable phospholipid bilayer featuring dynamic proteins, establishing cellular boundaries and ion gradients.";
        mechanics = [
          "Amphipathic lipids form a fluid mosaic bilayer, restricting polar solutes while permitting nonpolar passive diffusion.",
          "Integral transport proteins (pumps and channels) mediate passive facilitated diffusion and primary/secondary active transport.",
          "Active sodium-potassium pumps run on ATP hydrolysis to set up resting electrical potentials."
        ];
        analogy = "It works like a high-tech border checkpoint where passive cargo rolls through automatically, but specific high-value vehicles require specialized electronic passes (ATP).";
        experimentTip = "Switch between passive channels and active energy-driven pumps to observe the energetic expenditure required.";
      } else {
        coreExplanation = "The cell membrane acts as a semi-permeable protective boundary. It controls what passes into and out of the cell, establishing homeostasis.";
        mechanics = [
          "It is made of a lipid bilayer holding proteins.",
          "Allows small nonpolar molecules to slip through passively.",
          "Forces larger or charged particles to use specialized energy gates."
        ];
        analogy = "It acts like a secured gated living community with automated barcode lanes and manned security gates.";
        experimentTip = "Toggle transport methods to examine how high external concentration creates osmotic gradients.";
      }
    } else {
      // General Biology
      if (isKids) {
        coreExplanation = "This cell component does a marvelous job of helping the tiny cell live, feed, and grow successfully! 🌸";
        mechanics = [
          "It executes critical miniature tasks of synthesis.",
          "It cooperates with adjacent structures to build proteins.",
          "It responds dynamically to changing chemical environments."
        ];
        analogy = "It is like a helper robot in a big toy factory!";
        experimentTip = "Tap secondary cell structures on the diagram to learn their special jobs!";
      } else if (isExpert) {
        coreExplanation = "The macromolecular organellar network operates as an integrated biocatalytic system utilizing energy and enzymatic cascades to preserve cellular integrity.";
        mechanics = [
          "Membrane structures segment chemical environments to avoid enzymatic degradation.",
          "Vesicle transport tracks move cargo molecules along microtubules.",
          "Cytoskeletal scaffolding dynamically adjusts relative spatial layouts."
        ];
        analogy = "It operates as a decentralized nanofacturing plant with isolated cleanroom labs.";
        experimentTip = "Analyze the transport lab and map how solute gradients store free energy.";
      } else {
        coreExplanation = "This organelle acts as a specialized unit inside the cell, performing specific metabolic and structural roles critical for cellular survival.";
        mechanics = [
          "It helps synthesize, package, or transport cellular materials.",
          "It supports intracellular metabolic pathways.",
          "It works together with other cell structures to maintain balance."
        ];
        analogy = "It is like a specific department in a manufacturing company, focused on a singular division of labor.";
        experimentTip = "Select other components like Ribosomes or Golgi bodies to map out the protein synthesis assembly line.";
      }
    }
  } else if (sub.includes('phys') || sub.includes('orbit') || sub.includes('grav')) {
    if (top.includes('veloc') || top.includes('orbit') || top.includes('traject')) {
      if (isKids) {
        coreExplanation = "Gravity and speed are in a grand game of tug-of-war! 🛰️ Speed wants to make the planet fly away into empty space, but gravity keeps pulling it back in a beautiful loop!";
        mechanics = [
          "If the planet is too slow, it crashes into the middle star!",
          "If the planet is too fast, it zooms far away into dark space!",
          "At just the right speed, it loops in a perfect orbital circle!"
        ];
        analogy = "It's like spinning an apple tied to a string around your hand—the string is gravity!";
        experimentTip = "Try dragging the speed slider all the way up and watch the planet fly off the screen!";
      } else if (isExpert) {
        coreExplanation = "An orbit represents a continuous state of free-fall, dictated by the balance of a satellite's forward velocity and the central body's gravitational pull, modeled by Keplerian mechanics.";
        mechanics = [
          "Centripetal acceleration is supplied entirely by gravitational force: a_c = v² / r = GM / r².",
          "If tangential velocity matches circular speed, the orbital eccentricity remains zero (circular).",
          "If velocity exceeds escape velocity (v_esc = sqrt(2GM/r)), the path becomes hyperbolic."
        ];
        analogy = "It operates like a hyper-speed rail swinging around a curved track where centrifugal forces are perfectly resisted by banked magnetic tracks.";
        experimentTip = "Set the velocity exactly near circular velocity, then increase mass to see the transition to eccentric ellipses.";
      } else {
        coreExplanation = "Objects orbit in space because they have forward momentum (velocity) while being pulled down by gravity. This constant falling-but-missing-the-ground state sets the orbit trajectory.";
        mechanics = [
          "Fast speed results in centrifugal forces pushing the path outward.",
          "Gravity pulls the object inward, bending its path into a circle or ellipse.",
          "Stable orbits occur when gravity's inward pull matches centrifugal requirements."
        ];
        analogy = "It is like a skateboarder riding inside a giant smooth bowl, staying high on the walls thanks to speed.";
        experimentTip = "Reduce the distance to see how the planet must speed up to maintain its orbit!";
      }
    } else {
      // General Physics
      if (isKids) {
        coreExplanation = "Forces are a powerful invisible magic! 🌀 They push and pull objects around us every single second, deciding how things slide, float, or zoom.";
        mechanics = [
          "Heavy objects have a super strong pull on smaller objects.",
          "Mass is like weight—greater weight makes for a stronger attraction.",
          "Space orbits stay steady only when we keep factors in harmony."
        ];
        analogy = "It is like invisible elastic bands pulling objects together!";
        experimentTip = "Tweak the mass or distance sliders to feel how gravity weakens or strengthens!";
      } else if (isExpert) {
        coreExplanation = "Gravitational interactions are characterized by Newtonian mechanics, wherein force diminishes with the inverse square of the distance (F = G * m1 * m2 / r²).";
        mechanics = [
          "Space-time curvature or force vectors establish potential energy wells.",
          "Conservation of angular momentum dictates that orbital velocity increases as distance decreases.",
          "Perturbations in celestial variables alter orbital semi-major axes."
        ];
        analogy = "It's like rolling a billiard ball across a stretched rubber sheet where heavier weights warp the fabric.";
        experimentTip = "Simulate orbits with high mass settings to investigate Kepler's second law.";
      } else {
        coreExplanation = "Gravitational force dictates how massive objects attract one another, keeping planets orbiting stars and moons orbiting planets.";
        mechanics = [
          "More mass creates a stronger gravitational attraction.",
          "Greater distance rapidly diminishes the gravitational force (inverse-square law).",
          "Balanced speeds prevent colliding into central gravitational masses."
        ];
        analogy = "It is like a spiral coin funnel where the coin revolves faster and faster as it draws closer to the center drop.";
        experimentTip = "Use the slider to double the gravity constant, then trigger the simulator to watch the collapse path.";
      }
    }
  } else if (sub.includes('chem') || sub.includes('atom') || sub.includes('bond')) {
    if (top.includes('coval') || top.includes('covalent')) {
      if (isKids) {
        coreExplanation = "Covalent bonding is the ultimate sharing game! 🤝 Two atoms want to be happy, so they hold hands and share their toy electrons so they both feel complete!";
        mechanics = [
          "Atoms want their outer shell to be completely full of electrons.",
          "Since they don't have enough, they agree to share electrons.",
          "Sharing forms a super strong glue holding them together!"
        ];
        analogy = "It's like two friends sharing a single warm blanket so both stay cozy!";
        experimentTip = "Try examining the shared electron rings in stable molecules like H₂O or CO₂!";
      } else if (isExpert) {
        coreExplanation = "A covalent bond involves the localized sharing of valence electrons between electronegative nonmetal atoms, seeking to satisfy the octet rule through orbital overlap.";
        mechanics = [
          "Atomic orbitals overlap to form molecular orbitals of lower potential energy (bonding orbitals).",
          "Shared electrons are situated between the positive nuclei, minimizing repulsion forces.",
          "The bond strength is governed by orbital path overlaps and differences in electronegativity."
        ];
        analogy = "It behaves like two neighboring houses building a joint central playground that kids from both households can play in.";
        experimentTip = "Combine Oxygen and Hydrogen configurations on the atomic board to observe dual-valence electron sharing.";
      } else {
        coreExplanation = "Covalent bonding is the chemical bond formed when atoms share valence electrons. This is common between non-metal atoms trying to fill their outer electron shells.";
        mechanics = [
          "Atoms share electrons to satisfy the stable octet configuration (8 electrons).",
          "The shared electron pair exists in mutual attraction to both atomic nuclei.",
          "This sharing links the atoms together in a highly stable molecular structure."
        ];
        analogy = "It is like two business partners co-owning a critical delivery vehicle that both use to keep their businesses running.";
        experimentTip = "Model a stable covalent bond in the simulator to see how the electrons revolve around both central nuclei.";
      }
    } else if (top.includes('ionic')) {
      if (isKids) {
        coreExplanation = "Ionic bonding is a generous gift! 🎁 One atom gives an electron away, and the other happily takes it. Now they become opposite magnets and stick tight together!";
        mechanics = [
          "One atom has too many electrons, and another has too few.",
          "The generous atom shoots an electron gift over to its partner.",
          "This makes them electric opposites, causing them to magnetic-snap together!"
        ];
        analogy = "It's like giving a friendship bracelet to a buddy, linking you both instantly!";
        experimentTip = "Switch on Ionic Mode to witness how Sodium (Na) transfers its lonely outer electron to Chlorine (Cl)!";
      } else if (isExpert) {
        coreExplanation = "Ionic bonding arises from the complete electrostatic attraction between oppositely charged ions (cations and anions) formed via complete electron transfer.";
        mechanics = [
          "A highly electropositive metal transfers valence electrons to a highly electronegative nonmetallic atom.",
          "The resulting ions attain stable noble-gas electron shell octets.",
          "The strong, nondirectional electrostatic attractive forces aggregate into crystalline lattices."
        ];
        analogy = "It's like a magnet snap-lock where a post-transfer positive charge and a negative charge bind together with immense physical force.";
        experimentTip = "Trigger an Ionic transfer in the builder to trace how the metal atom shrinks after losing its outer shell.";
      } else {
        coreExplanation = "Ionic bonding is a chemical bond formed through the electrostatic attraction of oppositely charged ions. This occurs when one atom completely transfers electrons to another.";
        mechanics = [
          "One atom (usually a metal) loses electrons to become a positive cation.",
          "Another atom (usually a nonmetal) gains those electrons to become a negative anion.",
          "The opposite electrostatic charges cause them to bond tightly in crystal arrays."
        ];
        analogy = "It is like a customer purchasing a phone from a store—the exchange of funds (electrons) binds buyer and seller in a transaction bond.";
        experimentTip = "Observe the ionization process of Sodium when reacting to form the salt compound.";
      }
    } else {
      // General Chemistry
      if (isKids) {
        coreExplanation = "Atoms are the tiny LEGO bricks of the universe! 🧱 Everything you see—water, air, trees, and puppies—is made of different atom bricks stacked together!";
        mechanics = [
          "Protons and neutrons make up the super solid middle core.",
          "Electrons fly around the outside like tiny zooming bees.",
          "Shell rings hold electrons in neat patterns."
        ];
        analogy = "Atoms are like building blocks that can snap together to create endless creations!";
        experimentTip = "Try adding protons to watch your atom morph from Hydrogen into Helium right before your eyes!";
      } else if (isExpert) {
        coreExplanation = "Atomic structures are governed by quantum mechanics, consisting of a dense nucleus surrounded by discrete quantized electron energy shells.";
        mechanics = [
          "The nucleus contains protons defining atomic number, and neutrons establishing isotopes.",
          "Electrons occupy discrete orbitals (s, p, d, f) determined by quantum numbers.",
          "Valence reactivity is primarily determined by electron configuration in the outermost shell."
        ];
        analogy = "It behaves as a micro solar system where orbital shells represent strict, quantized flight paths.";
        experimentTip = "Add subatomic particles to helium to construct stable carbon configurations.";
      } else {
        coreExplanation = "Atoms are the fundamental building blocks of chemical matter, consisting of protons, neutrons, and orbiting electrons.";
        mechanics = [
          "The nucleus holds positive protons and neutral neutrons.",
          "Negative electrons orbit the nucleus in structured shell limits (2, 8, etc.).",
          "Valence shell fullness regulates chemical stability and bond potential."
        ];
        analogy = "It's like a planetary system where a dense sun attracts outer planets orbiting at specific distances.";
        experimentTip = "Add protons, neutrons, and electrons to balance an element's atomic charge.";
      }
    }
  } else {
    // Universal Backup Fallback
    if (isKids) {
      coreExplanation = "Wow! 🌟 This scientific element is super mysterious and fascinating! It works closely with everything else to make sure our simulation stays happy!";
      mechanics = [
        "It maintains its shape to support local balance.",
        "It reacts nicely when you change variables.",
        "It forms the basis of our playful STEM experiment!"
      ];
      analogy = "It is like a puzzle piece finding its perfect matching neighbor!";
      experimentTip = "Adjust parameters to notice how physical rules mold the simulation!";
    } else if (isExpert) {
      coreExplanation = "Analysis confirms that coordinates, variables and thermodynamic boundaries operate in an equilibrium state conforming to baseline Newtonian and biological vectors.";
      mechanics = [
        "Interactive cycles obey conservation of energy constraints.",
        "Phase dynamics exhibit structural integrity under nominal operational ranges.",
        "Valence shells or velocity curves converge cleanly to stable mathematical orbits."
      ];
      analogy = "It behaves as a calibrated mechanical watch dial where each interlocking wheel matches a precise constant.";
      experimentTip = "Alter standard simulation inputs to detect potential phase changes.";
    } else {
      coreExplanation = "This element represents a core scientific resource or parameter within our simulated lab environment, illustrating practical STEM principles.";
      mechanics = [
        "It acts as a key component of the subject system.",
        "It responds dynamically to direct user input and sliders.",
        "It demonstrates molecular, spatial, or force principles in action."
      ];
      analogy = "It functions as a gears system inside a transmission, adapting its speed dynamically to changing demands.";
      experimentTip = "Try altering the variables on the left controls panel to observe real-time differences.";
    }
  }

  return {
    coreExplanation,
    mechanics,
    analogy,
    experimentTip
  };
}

// 2. High-Fidelity Local Chat Responses
function getChatFallbackResponse(message: string, currentSubject: string, simplicity: string) {
  const msg = (message || '').toLowerCase();
  const simp = simplicity || 'student';

  let intro = "";
  let body = "";
  let suggestion = "";

  if (simp === 'kids') {
    intro = "🎨 **Sparky on Standby!** Hey there, little buddy! 🦕 We reached our super-computer's speed limit for a second, but I've got you covered!";
    if (msg.includes('mitochon') || msg.includes('powerhouse')) {
      body = "Mitochondria are the cute little battery packs inside you! They take the healthy apples or bananas you eat and turn them into super-charger energy! Without them, we wouldn't have any energy to run around or giggle!";
    } else if (msg.includes('nucleus') || msg.includes('dna')) {
      body = "The nucleus is the royal castle of the cell! It keeps a super-secret recipe book called DNA safe under lock and key. This book tells your body how to make brown hair, blue eyes, or grow tall!";
    } else if (msg.includes('orbit') || msg.includes('gravity') || msg.includes('planet')) {
      body = "Orbits are a giant game of space tag! 🪐 Gravity wants to pull gravity-friends together for a hug, but speed wants to zoom them in a straight line. Together, they make a perfect circular parade around the sun!";
    } else if (msg.includes('atom') || msg.includes('bond') || msg.includes('covalent')) {
      body = "Atoms are tiny LEGO bricks! Covalent bonds are the ultimate high-five sharing party: two atom friends hold hands to share their toy electrons and stick together tight!";
    } else {
      body = `Science is so much fun! In our **${currentSubject}** model, everything works together like a team of tiny friends. Let's keep exploring and tapping the big colorful buttons!`;
    }
    suggestion = "✨ **Sparky's Mini-Challenge:** Try sliding those sliders left and right to see how things react!";
  } else if (simp === 'expert') {
    intro = "🔬 **Sparky on Standby!** [Academic Fallback active due to high API load]. Let's address your inquiry regarding the physical mechanism:";
    if (msg.includes('mitochon') || msg.includes('powerhouse')) {
      body = "Mitochondria are specialized ATP generators. Oxidative phosphorylation occurs inside the folded internal membrane sheet cristae. Protons are systematically pumped across the intermembrane space to construct an electric field potential which powers ATP Synthase rotors to convert ADP.";
    } else if (msg.includes('nucleus') || msg.includes('dna')) {
      body = "The nucleus is a double-membrane cellular vault housing chromosomes. It operates as the transcription control panel. Synthesized transcripts (mRNA sequences) are exported through nuclear pore structures to cytosolic ribosomes for translation.";
    } else if (msg.includes('orbit') || msg.includes('gravity') || msg.includes('planet')) {
      body = "Standard celestial orbital pathways satisfy Kepler's and Newton's equations of state. Centripetal force balance is supplied by G*M1*M2/r². Total kinetic energy and angular momentum remain strictly invariant within a closed gravitational potential field.";
    } else if (msg.includes('atom') || msg.includes('bond') || msg.includes('covalent')) {
      body = "Quantized interactions dictate atomic stability. Covalent configuration represents overlap of valence orbital domains which minimizes compound free energy. Meanwhile, ionic bonding represents electrostatic interaction subsequent to physical thermodynamic electron transfer.";
    } else {
      body = `Regarding your inquiry on **${currentSubject}**: the system parameters adjust biological transport limits, atomic charges, or orbital radial eccentricity. System stability is maintained by preserving localized physical laws.`;
    }
    suggestion = "🔋 **Expert Challenge:** Observe if changing the kinetic velocity or particle charges creates a phase state transition in your lab window.";
  } else {
    // Normal Student Mode
    intro = "💡 **Sparky on Standby!** [API free-tier limit temporarily active]. Let me help you understand that:";
    if (msg.includes('mitochon') || msg.includes('powerhouse')) {
      body = "Mitochondria act as cellular engines! They process nutrients dynamically through respiration to produce ATP, which functions like a charged energy pack. The cell then trades ATP to power its transport gates, muscles, and thought cycles.";
    } else if (msg.includes('nucleus') || msg.includes('dna')) {
      body = "The nucleus acts as cell headquarters. It houses master DNA instructions, keeping them insulated from chemical hazards. When proteins are needed, it manufactures custom message notes (mRNA) that travel out to ribosomal construction workers.";
    } else if (msg.includes('orbit') || msg.includes('gravity') || msg.includes('planet')) {
      body = "Orbits happen when forward velocity matches gravity's inward pull. If a planet is too slow, it collapses into the star. If it's too fast, it escapes orbital bounds. Right in the sweet spot, it circles perpetually.";
    } else if (msg.includes('atom') || msg.includes('bond') || msg.includes('covalent')) {
      body = "Chemical bonds keep atoms connected. In a covalent bond, atoms co-share outer valence electrons so both can have full, happy shells. In ionic bonds, metal atoms trade away an electron to nonmetals, making them oppositely-charged social magnets that bond tightly.";
    } else {
      body = `In the **${currentSubject}** simulator, adjusting sliders altered concentration balances, speeds, or subatomic orbits. Science models help us isolate these different moving parts so we can predict outcomes in real-world systems!`;
    }
    suggestion = "🎯 **Sparky's Practice Quiz:** Go to our 'Quiz Hub' to test your mastery of these same core scientific rules!";
  }

  return `${intro}\n\n${body}\n\n${suggestion}`;
}

// 1. API: Custom AI Explanation for cell organelle, gravity parameter, or subatomic component
app.post('/api/explain-item', async (req, res) => {
  const { subject, topic, parameters, simplicityLevel } = req.body;
  const client = getGeminiClient();
  const simplicity = simplicityLevel || 'student';

  if (!client) {
    const fallback = getLocalFallbackExplanation(subject, topic, parameters, simplicity);
    return res.json(fallback);
  }

  try {
    let simplicityGuide = "";
    if (simplicity === 'kids') {
      simplicityGuide = "EXPLAIN LIKE I AM 5 YEARS OLD (ELI5). Use extremely simple, funny words, adorable comparisons, no complex words, short energetic sentences, and make it super fun for little kids.";
    } else if (simplicity === 'expert') {
      simplicityGuide = "EXPLAIN AT AN ADVANCED SCIENTIFIC LEVEL. Use formal academic terms, chemical/physic principles, precise metrics, details about thermodynamics, kinetics or structure, and standard professional explanations.";
    } else {
      simplicityGuide = "EXPLAIN IN EASY PLAIN ENGLISH. Use friendly, clear language that any average student or adult can understand easily without needing any science background.";
    }

    const prompt = `You are a warm, illustrative, and top-tier STEM academic tutor. 
Subject area: ${subject}
Topic: ${topic}
Interactive Physics/Simulation parameters currently set by user: ${JSON.stringify(parameters || {})}

Simplicity mode requested: ${simplicity.toUpperCase()}
Instruction: ${simplicityGuide}

Please explain the scientific properties, function, and behavior of this topic under these conditions.
Your answer must be extremely visual, accessible, exciting, and include:
1. A clear high-level visual description.
2. Step-by-step mechanical/structural breakdown (3 points).
3. A funny, easy-to-remember real-world analogy.
4. An actionable simulation experiment suggestion.

You must answer in JSON matching this schema:
{
  "coreExplanation": "Visual descriptive summary",
  "mechanics": ["Step 1", "Step 2", "Step 3"],
  "analogy": "Metaphorical analogy",
  "experimentTip": "Tip for tweaking the variables"
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coreExplanation: { type: Type.STRING },
            mechanics: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            analogy: { type: Type.STRING },
            experimentTip: { type: Type.STRING }
          },
          required: ["coreExplanation", "mechanics", "analogy", "experimentTip"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) throw new Error('No response from Gemini');
    const parsed = JSON.parse(textOutput);
    res.json(parsed);
  } catch (error: any) {
    console.warn('Gemini limit hit or connection issue in /explain-item; serving high-fidelity local physics/bio explanation fallback.', error.message);
    const fallback = getLocalFallbackExplanation(subject, topic, parameters, simplicity);
    res.json(fallback);
  }
});

// 2. API: Generate custom interactive Quiz on the subject
app.post('/api/generate-quiz', async (req, res) => {
  const { subject, difficulty } = req.body;
  const client = getGeminiClient();

  const mockQuizzes: Record<string, any[]> = {
    biology: [
      { id: 1, question: "Which organelle is considered the 'powerhouse of the cell' due to its ATP production?", options: ["Nucleus", "Mitochondria", "Lysosome", "Golgi Apparatus"], correctIndex: 1, explanation: "Mitochondria produce adenosine triphosphate (ATP) through cellular respiration, supplying cell energy." },
      { id: 2, question: "What is the primary function of the semi-permeable cell membrane?", options: ["Store DNA", "Synthesize lipids", "Regulate molecular entry and exit", "Degrade old proteins"], correctIndex: 2, explanation: "The cell membrane acts as a barrier regulating solute diffusion and gatekeeping substances." },
      { id: 3, question: "Which cellular structure contains the genetic blueprints of the eukaryotic cell?", options: ["Ribosomes", "Lysosomes", "Nucleus", "Endoplasmic Reticulum"], correctIndex: 2, explanation: "DNA is safely stored and transcribed or replicated within the secure nuclear membrane of the nucleus." }
    ],
    physics: [
      { id: 1, question: "If you double the velocity of a planet in orbit, what happens to its orbital radius tendency?", options: ["It spirals in", "It launches outward into space", "It remains completely unchanged", "Its mass shrinks"], correctIndex: 1, explanation: "Increasing velocity beyond orbital limit yields kinetic energy exceeding gravity's pull, causing runaway escape trajectory." },
      { id: 2, question: "What fundamental constant dictates Newton's Law of Universal Gravitation?", options: ["Planck constant", "Speed of light", "Gravitational constant (G)", "Boltzmann constant"], correctIndex: 2, explanation: "The constant G (6.674e-11) scales the mass-to-distance gravitational attraction force." },
      { id: 3, question: "In circular orbits, what provides the necessary centripetal force for raw celestial rotation?", options: ["Air pressure", "Gravitational force", "Centripetal friction", "Kinetic friction"], correctIndex: 1, explanation: "Gravitational pull between the central star and the planet acts as the physical 'string' providing the circular centripetal force." }
    ],
    chemistry: [
      { id: 1, question: "Why is water (H₂O) categorized as a covalent bond?", options: ["Electrons are transferred completely", "Electrons are shared between Hydrogen and Oxygen", "It doesn't involve outer shells", "Oxygen acts as a noble gas"], correctIndex: 1, explanation: "Hydrogen and Oxygen share valence electrons so both can satisfy their respective stable valence shells." },
      { id: 2, question: "How many valence electrons are present in a Sodium (Na) atom?", options: ["1", "8", "2", "7"], correctIndex: 0, explanation: "Sodium has atomic number 11 with configurations of 2, 8, 1, leaving exactly 1 electron in its outer valence shell." },
      { id: 3, question: "What type of bond forms when physical electrons are completely transferred from a metal to a non-metal?", options: ["Metallic Bond", "Covalent Bond", "Hydrogen Bond", "Ionic Bond"], correctIndex: 3, explanation: "Ionic bonds are formed by complete electron transfer resulting in positive and negative ions snapping together magnetically." }
    ]
  };

  if (!client) {
    const chosen = mockQuizzes[subject as string] || mockQuizzes['biology'];
    return res.json({ questions: chosen });
  }

  try {
    const prompt = `Generate a high-quality, scientifically accurate multiple-choice quiz about the STEM topic: "${subject}".
The student level is: "${difficulty}".
Create exactly 5 rich, interesting, practical questions.
For each question, provide:
- A clear, conceptual question.
- Exactly 4 plausible options.
- The correct option's 0-based index.
- A comprehensive explanation explaining why the correct choice is true and the others are false.

Return JSON according to this direct schema:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 2,
      "explanation": "Detailed explanation of the answer..."
    }
  ]
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "question", "options", "correctIndex", "explanation"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) throw new Error('No quiz generated by Gemini');
    const parsed = JSON.parse(textOutput);
    res.json(parsed);
  } catch (error: any) {
    console.warn('Gemini rate limit or network issue in /generate-quiz; serving resilient local template quiz instead.', error.message);
    const chosen = mockQuizzes[subject as string] || mockQuizzes['biology'];
    res.json({ questions: chosen });
  }
});

// 3. API: Tutor Interactive Chat with state context injection
app.post('/api/tutor-chat', async (req, res) => {
  const { message, history, currentSubject, currentContext, simplicityLevel } = req.body;
  const client = getGeminiClient();
  const simplicity = simplicityLevel || currentContext?.simplicityLevel || 'student';

  if (!client) {
    const textResp = getChatFallbackResponse(message, currentSubject, simplicity);
    return res.json({ text: textResp });
  }

  try {
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    let simplicityInstruction = "";
    if (simplicity === 'kids') {
      simplicityInstruction = "IMPORTANT: Explain like I am 5 years old (ELI5). Use extremely simple, funny words, emojis, easy-to-understand metaphors. Do not use scary mathematical symbols or chemical vocabulary unless with a funny illustrative definition. Keep it super energetic and happy!";
    } else if (simplicity === 'expert') {
      simplicityInstruction = "IMPORTANT: Explain at a high-level research expert level. Use precise chemical, physical, biological terms. Include references to relevant concepts and keep it intellectually rich and rigorous.";
    } else {
      simplicityInstruction = "IMPORTANT: Explain in simple plain English. Keep it clear, friendly, and digestible for everyone, avoiding unnecessarily complex academic buzzwords. Explain things beautifully with an easy real-world analogy.";
    }

    const systemInstruction = `You are "AI Sparky", an exceptional, creative, and enthusiastic, warm STEM tutor.
You are helping the student inside their virtual simulator.
Current module category: ${currentSubject || 'General Science'}
Current interactive simulator state: ${JSON.stringify(currentContext || {})}

Simplicity mode active: ${simplicity.toUpperCase()}
Style guidance: ${simplicityInstruction}

Keep your responses supportive, short (2-3 paragraphs max), and extremely clear. Do not write boring lectures. Relate your response directly to the physical state of their simulator parameters/atoms.`;

    const chatInput = `Student question: ${message}
Current simulator status is: ${JSON.stringify(currentContext || {})}.
Please answer this question directly according to your simplicity guidance, explaining how it relates to their Active Lab work. Add a fast practical challenge!`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: chatInput,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.warn('Gemini 429 rate limit or system error in /tutor-chat; serving custom robust chatbot response.', error.message);
    const textResp = getChatFallbackResponse(message, currentSubject, simplicity);
    res.json({ text: textResp });
  }
});

// Setup Vite Dev server or Production Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve build outputs in /dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Spark Server Running on Port: ${PORT}`);
  });
}

startServer();
