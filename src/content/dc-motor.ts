import type { Machine } from './types'

/**
 * A generic brushed DC motor — the kind in a cordless drill, a toy car or a
 * car window winder.
 *
 * Deliberately a different topology from the smartphone: the assembly is
 * rotational and axial rather than a flat stack, and the explode vectors fan
 * out radially and along the shaft. Nothing in the viewer needed changing to
 * support it, which is the point.
 *
 * Axis runs along X. Cylinders are modelled on Y and rotated a quarter turn
 * about Z to lie down.
 */

const AXIAL: [number, number, number] = [0, 0, Math.PI / 2]
const COPPER = '#c77b43'
const STEEL = '#8a9099'
const DARK_STEEL = '#4a4f57'
const LAMINATION = '#767c86'

export const dcMotor: Machine = {
  id: 'dc-motor',
  name: 'DC Motor',
  category: 'machines',
  tagline: 'Electricity in one end, spinning out the other',
  description:
    'A brushed DC motor is the simplest useful electric motor there is, and it has barely changed in a century. A fixed magnetic field, a coil that can rotate inside it, and a mechanical switch that flips the coil\'s current every half turn so the push never reverses. Open it up and you can see all four ideas in one place.',
  defaultCamera: { position: [3.6, 2.4, 5.0], target: [0, 0, 0] },
  parts: [
    {
      id: 'housing',
      name: 'Stator Housing',
      category: 'structure',
      layer: 0,
      position: [0, 0, 0],
      explode: [0, 2.7, 0],
      color: DARK_STEEL,
      metalness: 0.85,
      roughness: 0.35,
      shape: [
        {
          geometry: { type: 'cylinder', radius: 0.78, height: 2.2, segments: 40, openEnded: true },
          rotation: AXIAL,
        },
      ],
      tagline: 'A steel can that is also part of the magnetic circuit',
      body: [
        'The outer can looks like packaging, but it is doing magnetic work. Magnetic field lines have to form closed loops, and the steel shell is the return path — it carries the flux from the back of one magnet around to the back of the other.',
        'Using steel rather than aluminium is therefore not a cost decision. Steel has a magnetic permeability thousands of times higher than air, so the field strongly prefers to travel through it. A motor with an aluminium can would leak most of its field into the surrounding air and lose much of its torque.',
        'It also carries the mechanical load. The end caps are crimped or bolted to it, and it is what holds the two bearings in alignment — if the can is dented, the rotor rubs.',
      ],
      specs: [
        { label: 'Material', value: 'Low-carbon steel' },
        { label: 'Magnetic role', value: 'Flux return path (the yoke)' },
      ],
      analogy: 'The frame of a bicycle: it looks like structure, but it also sets how everything lines up.',
    },
    {
      id: 'magnets',
      name: 'Permanent Magnets',
      category: 'magnetic',
      layer: 1,
      position: [0.15, 0, 0],
      explode: [0, 1.5, 0],
      color: '#565a62',
      metalness: 0.55,
      roughness: 0.5,
      shape: [
        {
          geometry: {
            type: 'cylinder',
            radius: 0.66,
            height: 1.5,
            segments: 32,
            openEnded: true,
            thetaStart: 0.45,
            thetaLength: 2.2,
          },
          rotation: AXIAL,
        },
        {
          geometry: {
            type: 'cylinder',
            radius: 0.66,
            height: 1.5,
            segments: 32,
            openEnded: true,
            thetaStart: Math.PI + 0.45,
            thetaLength: 2.2,
          },
          rotation: AXIAL,
        },
      ],
      tagline: 'The fixed field the rotor pushes against',
      body: [
        'Two curved magnets are bonded to the inside of the can, one with its north face inward and one with its south face inward. Together they create a field that runs straight across the gap, through the space where the rotor sits.',
        'This is the half of the motor that never moves — the stator. All it has to do is hold a strong, steady field in the right place. Cheap motors use ferrite, which is brittle and weak but costs almost nothing; power tools use neodymium, which is several times stronger and lets the same torque come from a much smaller motor.',
        'The shaped curve matters. Keeping the air gap between magnet and rotor small and even makes the field stronger and the torque smoother, which is why the magnets are arcs rather than flat slabs.',
      ],
      specs: [
        { label: 'Material', value: 'Ferrite, or neodymium in high-power motors' },
        { label: 'Arrangement', value: 'Two poles, N and S facing inward' },
        { label: 'Air gap', value: 'Typically 0.3 – 1 mm' },
      ],
      analogy: 'Two hands held either side of a compass needle, deciding which way it wants to point.',
    },
    {
      id: 'armature',
      name: 'Armature',
      category: 'electrical',
      layer: 2,
      position: [0.15, 0, 0],
      explode: [0.1, 0, 0],
      color: LAMINATION,
      metalness: 0.7,
      roughness: 0.45,
      shape: [
        {
          geometry: { type: 'cylinder', radius: 0.32, height: 1.15, segments: 28 },
          rotation: AXIAL,
        },
        {
          geometry: { type: 'torus', radius: 0.43, tube: 0.11, segments: 28 },
          offset: [-0.32, 0, 0],
          rotation: [0, Math.PI / 2, 0],
          repeat: { count: 3, step: [0.32, 0, 0] },
          color: COPPER,
          metalness: 0.85,
          roughness: 0.3,
        },
      ],
      tagline: 'The electromagnet that chases the field and never catches it',
      body: [
        'The rotor is a stack of thin steel discs with coils of enamelled copper wound through slots in it. Run current through a coil and it becomes an electromagnet; its poles are then pulled toward the opposite poles of the permanent magnets, and the rotor turns.',
        'If nothing else happened, it would swing round, line up, and stop — like a compass needle settling. The commutator exists to prevent exactly that: just as the rotor reaches alignment, the current is reversed, the electromagnet flips polarity, and what was an attraction becomes a push. The rotor is permanently chasing a target that keeps moving.',
        'The core is a stack of insulated laminations rather than one solid lump of steel for a specific reason. A solid core sitting in a changing magnetic field would have large circular currents induced inside it — eddy currents — which do no useful work and simply heat the metal. Slicing the core into insulated layers breaks those loops up and the losses fall sharply.',
      ],
      specs: [
        { label: 'Core', value: 'Insulated steel laminations, 0.35 – 0.5 mm' },
        { label: 'Windings', value: 'Enamelled copper, 3+ coils' },
        { label: 'Why laminated', value: 'Breaks up eddy currents' },
      ],
      analogy:
        'A donkey following a carrot on a stick. The carrot moves every time the donkey gets close, so it never stops walking.',
    },
    {
      id: 'commutator',
      name: 'Commutator',
      category: 'electrical',
      layer: 3,
      position: [-0.72, 0, 0],
      explode: [-0.75, 0, 0],
      color: COPPER,
      metalness: 0.88,
      roughness: 0.28,
      shape: [
        { geometry: { type: 'cylinder', radius: 0.24, height: 0.3, segments: 24 }, rotation: AXIAL },
        {
          geometry: { type: 'box', size: [0.33, 0.03, 0.44] },
          rotation: [0, 0, 0],
          color: '#1a1c20',
          metalness: 0.1,
          roughness: 0.9,
        },
        {
          geometry: { type: 'box', size: [0.33, 0.44, 0.03] },
          color: '#1a1c20',
          metalness: 0.1,
          roughness: 0.9,
        },
      ],
      tagline: 'A rotating switch that flips the current twice per turn',
      body: [
        'This is the clever part, and the whole reason a brushed motor works on direct current. The commutator is a copper drum split into insulated segments, each wired to one end of a rotor coil, and it spins with the rotor.',
        'The brushes press on it from outside and do not move. So as the rotor turns, the segment under each brush changes, and the current through the coil reverses — automatically, mechanically, at exactly the right moment in every rotation. No electronics, no sensors, no controller.',
        'It is also the motor\'s main weakness. It is a sliding electrical contact that sparks every time it switches, which erodes the copper, generates radio interference, and sets a ceiling on speed. Brushless motors delete this part entirely and do the switching with transistors and a position sensor instead — which is why they last longer, but also why they cannot run without a controller.',
      ],
      specs: [
        { label: 'Segments', value: '3 or more, one pair per coil' },
        { label: 'Switching', value: 'Twice per revolution, per coil' },
        { label: 'Wear item', value: 'Yes — erodes and sparks' },
      ],
      analogy:
        'A railway turntable that reverses the track direction automatically every time the train comes round.',
    },
    {
      id: 'brushes',
      name: 'Carbon Brushes',
      category: 'electrical',
      layer: 4,
      position: [-0.72, 0, 0],
      explode: [-1.5, 0, 0],
      color: '#26282d',
      metalness: 0.2,
      roughness: 0.85,
      shape: [
        { geometry: { type: 'box', size: [0.2, 0.2, 0.16] }, offset: [0, 0.36, 0] },
        { geometry: { type: 'box', size: [0.2, 0.2, 0.16] }, offset: [0, -0.36, 0] },
        {
          geometry: { type: 'cylinder', radius: 0.055, height: 0.22, segments: 10 },
          offset: [0, 0.56, 0],
          color: STEEL,
          metalness: 0.9,
          roughness: 0.3,
        },
        {
          geometry: { type: 'cylinder', radius: 0.055, height: 0.22, segments: 10 },
          offset: [0, -0.56, 0],
          color: STEEL,
          metalness: 0.9,
          roughness: 0.3,
        },
      ],
      tagline: 'Spring-loaded carbon blocks that feed power to a spinning part',
      body: [
        'Getting electricity into something that rotates is harder than it sounds — you cannot just solder a wire to it. The answer is a sliding contact: two blocks of carbon, pushed by springs against the spinning commutator.',
        'Carbon is chosen deliberately over metal. It conducts well enough, it is self-lubricating so it slides without seizing, and crucially it is the softer of the two materials — so the brushes wear out instead of the commutator. They are the designed sacrificial part, cheap and replaceable, which is why a drill has little screw-out caps on the side.',
        'The springs matter as much as the carbon. Too little pressure and the contact arcs and burns; too much and the brush grinds itself away in hours. As a brush wears down, the spring has to keep the same pressure across the whole of its life.',
      ],
      specs: [
        { label: 'Material', value: 'Carbon / graphite composite' },
        { label: 'Contact', value: 'Spring-loaded, sliding' },
        { label: 'Service life', value: 'The first thing to wear out' },
      ],
      analogy:
        'A pen nib dragging on paper — deliberately the softer of the two, so the paper survives and the nib does the wearing.',
    },
    {
      id: 'shaft',
      name: 'Output Shaft',
      category: 'mechanical',
      layer: 5,
      position: [0.2, 0, 0],
      explode: [0, -1.7, 0],
      color: STEEL,
      metalness: 0.92,
      roughness: 0.22,
      shape: [{ geometry: { type: 'cylinder', radius: 0.09, height: 3.1, segments: 20 }, rotation: AXIAL }],
      tagline: 'The only part that leaves the motor doing work',
      body: [
        'Everything else in the motor exists to turn this rod. The armature and commutator are pressed onto it, the bearings locate it, and one end protrudes through the front cap to drive a gearbox, a fan or a wheel.',
        'It is hardened and ground steel, because it has to resist both twisting under torque and bending under whatever side load a belt or gear puts on it. The usable end is usually machined with a flat, a keyway or splines, so a pulley cannot slip round it.',
        'An important consequence of how the motor works: a DC motor produces its maximum torque at zero speed, the instant you switch it on with the shaft held still. That is also when it draws the most current, which is why a stalled motor overheats quickly.',
      ],
      specs: [
        { label: 'Material', value: 'Hardened, ground steel' },
        { label: 'Drive feature', value: 'Flat, keyway or splines' },
        { label: 'Peak torque', value: 'At zero speed (stall)' },
      ],
    },
    {
      id: 'bearings',
      name: 'Bearings',
      category: 'mechanical',
      layer: 6,
      position: [0.2, 0, 0],
      explode: [0, -1.7, 0],
      color: '#b4b9c2',
      metalness: 0.9,
      roughness: 0.2,
      shape: [
        {
          geometry: { type: 'torus', radius: 0.17, tube: 0.07, segments: 24 },
          offset: [-1.25, 0, 0],
          rotation: [0, Math.PI / 2, 0],
        },
        {
          geometry: { type: 'torus', radius: 0.17, tube: 0.07, segments: 24 },
          offset: [1.1, 0, 0],
          rotation: [0, Math.PI / 2, 0],
        },
      ],
      tagline: 'Holding the rotor exactly central, with almost no friction',
      body: [
        'The rotor spins a fraction of a millimetre away from the magnets. If it drifts off-centre it rubs, and the motor destroys itself. The bearings are what hold that gap.',
        'Cheap motors use plain bronze bushes, often oil-impregnated so they are self-lubricating: the shaft slides directly on the metal, which is quiet and cheap but has real friction. Better motors use ball bearings, where the shaft rides on hardened balls in a track so that sliding friction is replaced by rolling friction — a far smaller loss, and one that barely rises with speed.',
        'There are always two, spaced as far apart as the design allows. One bearing would let the shaft wobble; two separated along the axis fix both its position and its angle.',
      ],
      specs: [
        { label: 'Types', value: 'Sintered bronze bush, or ball race' },
        { label: 'Count', value: 'Two, one per end' },
      ],
    },
    {
      id: 'front-cap',
      name: 'Front End Cap',
      category: 'structure',
      layer: 7,
      position: [1.18, 0, 0],
      explode: [2.1, 0, 0],
      color: DARK_STEEL,
      metalness: 0.8,
      roughness: 0.4,
      shape: [
        { geometry: { type: 'cylinder', radius: 0.78, height: 0.11, segments: 40 }, rotation: AXIAL },
        {
          geometry: { type: 'cylinder', radius: 0.26, height: 0.22, segments: 24 },
          offset: [0.1, 0, 0],
          rotation: AXIAL,
          color: STEEL,
        },
      ],
      tagline: 'Closes the can and holds the front bearing',
      body: [
        'The front cap does two jobs: it seals the housing and it carries the bearing that the output shaft runs in. Its central boss is machined concentric with the can, because any error there becomes rotor misalignment.',
        'On most small motors it is not bolted on at all. Tabs on the steel can are simply folded over it, which is fast and cheap to assemble — and the reason that taking one apart usually means bending metal you cannot neatly bend back.',
        'It is also the mounting face. The threaded holes or flange on the front are how the whole motor attaches to whatever it drives.',
      ],
    },
    {
      id: 'rear-cap',
      name: 'Rear End Cap & Terminals',
      category: 'connectivity',
      layer: 8,
      position: [-1.18, 0, 0],
      explode: [-2.1, 0, 0],
      color: DARK_STEEL,
      metalness: 0.8,
      roughness: 0.4,
      shape: [
        { geometry: { type: 'cylinder', radius: 0.78, height: 0.11, segments: 40 }, rotation: AXIAL },
        {
          geometry: { type: 'box', size: [0.1, 0.16, 0.3] },
          offset: [-0.14, 0.34, 0],
          color: '#c9a227',
          metalness: 0.9,
          roughness: 0.25,
        },
        {
          geometry: { type: 'box', size: [0.1, 0.16, 0.3] },
          offset: [-0.14, -0.34, 0],
          color: '#c9a227',
          metalness: 0.9,
          roughness: 0.25,
        },
      ],
      tagline: 'Where the two wires go in — and the only control you get',
      body: [
        'The back cap carries the brush holders and the two terminals. That is the entire electrical interface of the motor: two tabs.',
        'Swap the two wires and the motor runs backwards, because reversing the supply reverses the current in the coils and therefore the direction of every push. Vary the average voltage — normally by switching it on and off thousands of times a second rather than wasting it as heat in a resistor — and you vary the speed.',
        'This simplicity is the brushed motor\'s enduring advantage. It needs no controller, no sensor and no electronics at all: connect it to a battery and it runs. Every other motor type buys efficiency or lifespan at the price of needing something intelligent to drive it.',
      ],
      specs: [
        { label: 'Terminals', value: 'Two — supply and return' },
        { label: 'Reversing', value: 'Swap the two wires' },
        { label: 'Speed control', value: 'PWM of the supply voltage' },
      ],
      analogy: 'A light bulb socket. Two contacts, no cleverness required, works the moment you connect it.',
    },
  ],
}
