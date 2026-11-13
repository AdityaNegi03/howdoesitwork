import type { Machine, ShapeNode, Vec3 } from './types'

/**
 * A generic discrete graphics card, not any particular vendor's.
 *
 * A third teardown topology: a flat PCB with a multi-layer cooler stacked on
 * its front face, plus sub-assemblies mounted *on* the board (die, memory,
 * power stages) that lift away from it rather than stacking with it.
 *
 * Card lies in the XY plane, 6.6 long x 2.6 tall. The cooler builds up in +Z
 * toward the viewer; the backplate sits at -Z. The PCB is the anchor and does
 * not move when the assembly explodes.
 */

const PCB_DARK = '#13241c'
const COPPER = '#c3763f'
const NICKEL = '#b6bcc6'
const ALU = '#969ca5'
const PLASTIC = '#1b1e24'
const GOLD = '#caa83a'

/**
 * `repeat` only steps linearly, which cannot describe blades around a hub.
 * Machine files are TypeScript, so the nodes are just generated instead.
 */
function fanBlades(count: number, radius: number): ShapeNode[] {
  return Array.from({ length: count }, (_, i): ShapeNode => {
    const angle = (i / count) * Math.PI * 2
    const offset: Vec3 = [Math.cos(angle) * radius * 0.52, Math.sin(angle) * radius * 0.52, 0]
    return {
      geometry: { type: 'box', size: [radius * 0.88, 0.24, 0.03] },
      offset,
      // Pitch about Y, then swing into position about Z (Euler XYZ order).
      rotation: [0, 0.55, angle],
      color: '#3d434c',
      metalness: 0.25,
      roughness: 0.62,
    }
  })
}

function fan(centerX: number, radius: number): ShapeNode[] {
  const hub: ShapeNode = {
    geometry: { type: 'cylinder', radius: 0.2, height: 0.14, segments: 24 },
    offset: [centerX, 0, 0],
    rotation: [Math.PI / 2, 0, 0],
    color: '#15181d',
    metalness: 0.4,
    roughness: 0.5,
  }
  const ring: ShapeNode = {
    geometry: { type: 'torus', radius, tube: 0.045, segments: 40 },
    offset: [centerX, 0, 0],
    color: PLASTIC,
    metalness: 0.2,
    roughness: 0.75,
  }
  const blades = fanBlades(9, radius).map((node): ShapeNode => {
    const [x, y, z] = node.offset ?? [0, 0, 0]
    return { ...node, offset: [x + centerX, y, z] }
  })
  return [ring, hub, ...blades]
}

export const gpu: Machine = {
  id: 'gpu',
  name: 'Graphics Card',
  category: 'computer-accessories',
  tagline: 'Thousands of small processors, and the heroic effort to keep them cool',
  description:
    'A graphics card is two problems bolted together. The first is computational: a chip with thousands of simple cores that all do the same arithmetic at once, fed by memory fast enough to keep up. The second is thermal — that chip turns three hundred watts into heat in a space the size of a postage stamp, and most of the volume of the card exists purely to move that heat into the air. Open it up and the cooler comes off in layers before you ever reach the electronics.',
  defaultCamera: { position: [6.6, 4.6, 6.2], target: [0, 0, 0] },
  parts: [
    {
      id: 'shroud',
      name: 'Shroud',
      category: 'structure',
      layer: 0,
      position: [0, 0, 1.2],
      explode: [0, 0, 3.7],
      color: PLASTIC,
      metalness: 0.25,
      roughness: 0.72,
      shape: [
        { geometry: { type: 'box', size: [6.5, 0.32, 0.5], radius: 0.06 }, offset: [0, 1.16, 0] },
        { geometry: { type: 'box', size: [6.5, 0.32, 0.5], radius: 0.06 }, offset: [0, -1.16, 0] },
        { geometry: { type: 'box', size: [0.32, 2.3, 0.5], radius: 0.06 }, offset: [-3.09, 0, 0] },
        { geometry: { type: 'box', size: [0.32, 2.3, 0.5], radius: 0.06 }, offset: [3.09, 0, 0] },
        { geometry: { type: 'box', size: [0.3, 2.3, 0.5], radius: 0.06 }, offset: [0, 0, 0] },
      ],
      tagline: 'Plastic that decides where the air goes',
      body: [
        'The shroud looks like styling, and it is, but it is also the duct. A fan on its own just stirs air around; the shroud forces the air the fan moves to go through the fin stack instead of escaping sideways, and it seals the gap between fan and fins so that none of the pressure is wasted.',
        'It is also why the card has a recognisable shape. Most of a graphics card\'s volume is not electronics — the board is often barely half the length of the card — and the rest is cooler and the plastic that aims it.',
        'Many cards leave a deliberate opening at one end where the PCB stops. The rear fan blows straight through the fin stack and out the other side of the card rather than recirculating, which is worth several degrees.',
      ],
      analogy: 'The nozzle on a hairdryer. The fan makes the air move; the shaped plastic decides where it goes.',
    },
    {
      id: 'fans',
      name: 'Axial Fans',
      category: 'thermal',
      layer: 1,
      position: [0, 0, 1.25],
      explode: [0, 0, 2.95],
      color: PLASTIC,
      metalness: 0.2,
      roughness: 0.7,
      shape: [...fan(-1.6, 0.66), ...fan(1.6, 0.66)],
      tagline: 'Angled blades that pull air down onto the fins',
      body: [
        'Each blade is a small wing. As it sweeps round, its angled face pushes air ahead of it and leaves a slight low pressure behind, so air is drawn in from the front of the card and driven down into the fin stack.',
        'The design trade-off is pressure versus volume. A fan with shallow blades moves a lot of air but gives up easily when something resists it; a dense fin stack is exactly such a resistance. Graphics-card fans therefore run steeper, closely spaced blades that sacrifice raw airflow for the static pressure needed to force air through a tight fin gap.',
        'The blade count is usually a prime number, and the blades are often unevenly spaced. Evenly spaced blades all pass a given obstruction in lockstep and produce one loud, pure tone; staggering them spreads that energy across frequencies, so the same volume of noise reads to the ear as a softer rush rather than a whine.',
        'Below roughly 50 °C most cards stop the fans entirely. There is no point spending noise on heat the passive fin stack can shed on its own.',
      ],
      specs: [
        { label: 'Type', value: 'Axial, 9 blades' },
        { label: 'Tuned for', value: 'Static pressure over free airflow' },
        { label: 'Idle behaviour', value: 'Stopped below ~50 °C' },
      ],
      analogy: 'A row of tiny aircraft propellers, pitched steeply because they are blowing into a thicket.',
    },
    {
      id: 'fin-stack',
      name: 'Fin Stack',
      category: 'thermal',
      layer: 2,
      position: [0.2, 0.05, 0.78],
      explode: [0, 0, 2.15],
      color: ALU,
      metalness: 0.85,
      roughness: 0.35,
      shape: [
        {
          geometry: { type: 'box', size: [0.022, 1.95, 0.68] },
          offset: [-2.73, 0, 0],
          repeat: { count: 40, step: [0.14, 0, 0] },
        },
      ],
      tagline: 'Forty thin plates turning metal into surface area',
      body: [
        'Heat leaves a solid object into air at a rate set by three things: the temperature difference, how fast the air moves, and the area of contact. The first is fixed by what the chip can tolerate, the second is what the fans are for, and this is the third.',
        'A solid aluminium block the size of this cooler would have perhaps a hundred square centimetres of surface. Slicing it into forty plates two tenths of a millimetre thick multiplies that by well over an order of magnitude, while removing metal rather than adding it. The fin stack weighs less than the block it came from and sheds far more heat.',
        'There is a limit. Pack the fins too closely and the air between them cannot move; each fin is then sitting in air already warmed by its neighbours, and the extra area does nothing. The spacing you see is a balance between surface area and the static pressure the fans can actually produce.',
        'The fins are aluminium rather than copper, which conducts worse but weighs a third as much. Since the heat pipes have already carried the heat to the fins, what matters here is area and airflow, not raw conductivity — so the weight saving wins.',
      ],
      specs: [
        { label: 'Fin count', value: '~40 – 90 typical' },
        { label: 'Fin thickness', value: '0.2 – 0.4 mm' },
        { label: 'Material', value: 'Aluminium (light), fed by copper pipes' },
      ],
      analogy:
        'Hanging washing out: the same cloth dries far quicker spread across a line than wadded into a ball.',
    },
    {
      id: 'heat-pipes',
      name: 'Heat Pipes',
      category: 'thermal',
      layer: 3,
      position: [0.1, 0, 0.32],
      explode: [0, 1.75, 1.45],
      color: COPPER,
      metalness: 0.9,
      roughness: 0.28,
      shape: [
        {
          geometry: { type: 'cylinder', radius: 0.1, height: 5.3, segments: 18 },
          offset: [0, -0.66, 0],
          rotation: [0, 0, Math.PI / 2],
          repeat: { count: 5, step: [0, 0.33, 0] },
        },
      ],
      tagline: 'Sealed copper tubes that move heat by boiling',
      body: [
        'A heat pipe looks like a solid copper rod and behaves like something far better. It is a sealed tube holding a wick and a small amount of fluid, with the air pumped out so the fluid boils at a low temperature rather than at 100 °C.',
        'At the hot end the fluid boils. Doing so absorbs a large amount of energy — the latent heat of vaporisation — without the metal getting any hotter. The vapour rushes to the cooler end, condenses back to liquid and releases that energy into the fins. The wick then carries the liquid back to the hot end by capillary action, the same effect that draws water up a paper towel.',
        'Nothing pumps it and nothing wears out; the cycle is driven entirely by the temperature difference. The result conducts heat along its length something like a hundred times better than a solid copper rod of the same size.',
        'The flattened sections you see where the pipes meet the baseplate are deliberate. Squashing the pipe increases the contact area with the heat source, at some cost to the vapour space inside.',
      ],
      specs: [
        { label: 'Working fluid', value: 'Water, under partial vacuum' },
        { label: 'Return mechanism', value: 'Capillary action through a wick' },
        { label: 'Effective conductivity', value: '~10,000 – 100,000 W/m·K' },
      ],
      analogy:
        'A relay runner who sprints the heat down the tube, hands it over, and walks back along the inside wall to do it again.',
    },
    {
      id: 'vapor-chamber',
      name: 'Vapour Chamber',
      category: 'thermal',
      layer: 4,
      position: [-1.1, 0, 0.16],
      explode: [0, 0, 0.95],
      color: NICKEL,
      metalness: 0.88,
      roughness: 0.25,
      shape: [
        { geometry: { type: 'box', size: [3.3, 2.35, 0.13], radius: 0.04 } },
        {
          geometry: { type: 'box', size: [0.9, 0.9, 0.04] },
          offset: [-0.3, 0.1, -0.085],
          color: '#8d93a0',
          metalness: 0.7,
          roughness: 0.4,
        },
      ],
      tagline: 'A heat pipe flattened into a plate',
      body: [
        'The die is about 25 mm square, and the fin stack is nearly twenty times that long. Something has to spread the heat out before it can be handed to the pipes, because a hot spot that small would overwhelm the few pipes directly above it and leave the rest of the cooler barely warm.',
        'A vapour chamber is the same boiling-and-condensing trick as a heat pipe, but flattened into a plate so it works in two dimensions. Fluid boils directly above the die and condenses across the whole underside of the plate, evening out the temperature far faster than solid metal could.',
        'Its flatness matters as much as its conductivity. The chamber is machined flat to within a few microns where it meets the die, because even a polished surface touching another polished surface traps insulating air in the microscopic gaps — which is what the thin layer of thermal paste between them exists to displace.',
        'Cheaper cards skip it and use a solid copper block. That works, it just means the pipes nearest the die do most of the work and the cooler is less effective than its size suggests.',
      ],
      specs: [
        { label: 'Principle', value: 'Two-dimensional phase change' },
        { label: 'Contact flatness', value: 'Within a few microns' },
        { label: 'Interface', value: 'Thermal paste fills the microscopic gaps' },
      ],
    },
    {
      id: 'pcb',
      name: 'Printed Circuit Board',
      category: 'structure',
      layer: 5,
      position: [-1.0, 0, 0],
      explode: [0, 0, 0],
      color: PCB_DARK,
      metalness: 0.12,
      roughness: 0.68,
      shape: [
        { geometry: { type: 'box', size: [4.4, 2.5, 0.09], radius: 0.05 } },
        {
          geometry: { type: 'box', size: [3.6, 0.018, 0.005] },
          offset: [0, -1.0, 0.048],
          repeat: { count: 9, step: [0, 0.25, 0] },
          color: '#2f6b4e',
          metalness: 0.4,
          roughness: 0.5,
        },
      ],
      tagline: 'Fourteen layers of copper, mostly carrying power',
      body: [
        'The board is not a sheet with wires printed on it. It is a laminate of a dozen or more copper layers separated by glass-reinforced epoxy, with the connections between layers drilled and plated through.',
        'Most of those layers are not signals at all. They are solid sheets of copper carrying power and ground, because delivering several hundred amps to a chip in the middle of the board requires enormous copper cross-section and a very low-impedance path. The signal routing is squeezed into the layers between them.',
        'Where signals do run — the memory bus especially — the traces are drawn as deliberate squiggles. At these frequencies a signal takes a measurable time to travel, so every line in a parallel bus is lengthened to match the longest one. If they arrived at different moments the data would be read wrong, and the squiggles are how the lengths are made equal.',
        'This is also the part that sets the card\'s shape and rigidity, and the reason a heavy cooler needs a backplate: an unsupported board with a kilogram of metal hanging off it will slowly bend.',
      ],
      specs: [
        { label: 'Layers', value: '10 – 16 copper' },
        { label: 'Dominant use', value: 'Power and ground planes' },
        { label: 'Trace squiggles', value: 'Length-matching, not decoration' },
      ],
    },
    {
      id: 'gpu-die',
      name: 'GPU Die',
      category: 'compute',
      layer: 6,
      position: [-1.4, 0.1, 0.07],
      explode: [-1.3, -2.15, 0.6],
      color: '#26412f',
      metalness: 0.3,
      roughness: 0.55,
      shape: [
        { geometry: { type: 'box', size: [1.0, 1.0, 0.06], radius: 0.02 } },
        {
          geometry: { type: 'box', size: [0.66, 0.66, 0.045] },
          offset: [0, 0, 0.05],
          color: '#9298a4',
          metalness: 0.75,
          roughness: 0.22,
        },
      ],
      tagline: 'Thousands of simple cores doing the same thing at once',
      body: [
        'A CPU core is built to finish one complicated instruction stream as fast as possible, and spends most of its transistors on prediction, caching and reordering to do it. A GPU gives all that up. It fills the same silicon with thousands of small, simple arithmetic units instead, and accepts that each is individually slow.',
        'That only works because of what graphics asks for. Shading two million pixels means running the same short program two million times on different data, and those runs do not depend on each other. So the chip groups threads into batches — typically 32 — and runs each batch in lockstep, one instruction broadcast to all of them. One instruction decoder now feeds 32 arithmetic units instead of one, and the transistors saved go into more units.',
        'The weakness is the mirror image of the strength. When threads in a batch disagree about a branch, the hardware has to run both paths and mask off the threads that should not have taken each one — so divergent code can cost you most of the chip. Work that is genuinely sequential, or full of unpredictable branching, runs better on a CPU.',
        'It turned out that training neural networks is the same shape of problem as shading pixels: enormous numbers of independent multiply-accumulates over matrices. That is why a part designed for games became the foundation of modern machine learning, and why recent dies devote large areas to units that do nothing but multiply small matrices.',
      ],
      specs: [
        { label: 'Transistors', value: '45 – 90 billion' },
        { label: 'Die size', value: '~300 – 600 mm²' },
        { label: 'Cores', value: '10,000 – 20,000 shader units' },
        { label: 'Execution', value: 'Batches of 32 threads in lockstep' },
      ],
      analogy:
        'A CPU is a few PhDs solving hard problems in sequence. A GPU is ten thousand schoolchildren all doing one times-table at once.',
    },
    {
      id: 'vram',
      name: 'Video Memory',
      category: 'compute',
      layer: 6,
      position: [-1.4, 0.1, 0.07],
      explode: [1.5, -2.15, 0.6],
      color: '#15181d',
      metalness: 0.35,
      roughness: 0.5,
      shape: [
        {
          geometry: { type: 'box', size: [0.38, 0.3, 0.05], radius: 0.015 },
          offset: [-0.82, 0.78, 0],
          repeat: { count: 3, step: [0.82, 0, 0] },
        },
        {
          geometry: { type: 'box', size: [0.38, 0.3, 0.05], radius: 0.015 },
          offset: [-0.82, -0.78, 0],
          repeat: { count: 3, step: [0.82, 0, 0] },
        },
      ],
      tagline: 'Placed as close to the die as physics allows',
      body: [
        'Those thousands of cores are useless if they are waiting for data, and a GPU can consume it at over a terabyte per second. Ordinary system memory is nowhere near that, so the card carries its own.',
        'The speed comes from width rather than cleverness. System RAM talks to the CPU over a 64-bit path; a graphics card runs a 256- or 384-bit bus split across these packages, each wired directly to the die over its own set of traces. Many lanes in parallel, all switching at once.',
        'This is why the chips are crowded right up against the die in a ring. Every millimetre of trace adds delay and distortion at these frequencies, so the layout is a compromise between getting them close and leaving room for the power delivery that has to reach the die from the other side.',
        'Memory capacity and memory bandwidth are different things, and they fail differently. Run out of bandwidth and the card gets slower; run out of capacity and data has to spill across the PCIe bus to system RAM, which is roughly an order of magnitude slower — the difference between a lower frame rate and a model that will not load at all.',
      ],
      specs: [
        { label: 'Type', value: 'GDDR6 / GDDR7' },
        { label: 'Bus width', value: '192 – 384 bit' },
        { label: 'Bandwidth', value: '600 GB/s – 1.5 TB/s' },
        { label: 'Packages', value: '6 – 12, ringed around the die' },
      ],
    },
    {
      id: 'vrm',
      name: 'Power Stages',
      category: 'power',
      layer: 7,
      position: [0.52, 0, 0.09],
      explode: [2.9, 0, 0.6],
      color: '#22262c',
      metalness: 0.45,
      roughness: 0.5,
      shape: [
        {
          geometry: { type: 'box', size: [0.26, 0.26, 0.18], radius: 0.03 },
          offset: [0, -1.0, 0],
          repeat: { count: 7, step: [0, 0.33, 0] },
          color: '#3a3f47',
          metalness: 0.6,
          roughness: 0.45,
        },
        {
          geometry: { type: 'box', size: [0.2, 0.17, 0.08] },
          offset: [-0.38, -1.0, 0],
          repeat: { count: 7, step: [0, 0.33, 0] },
          color: '#101318',
        },
        {
          geometry: { type: 'cylinder', radius: 0.1, height: 0.22, segments: 16 },
          offset: [0.38, -0.84, 0.04],
          rotation: [Math.PI / 2, 0, 0],
          repeat: { count: 5, step: [0, 0.42, 0] },
          color: '#4a4036',
          metalness: 0.5,
          roughness: 0.55,
        },
      ],
      tagline: 'Turning 12 volts into one volt at five hundred amps',
      body: [
        'The die runs at roughly one volt. At 350 watts, that is around 350 amps — more current than an arc welder draws, delivered into a chip the size of a postage stamp, and it has to stay within a few tens of millivolts while the load swings wildly as the card starts and stops work.',
        'No single converter can do that, so the job is split across these phases. Each one is a pair of transistors chopping the 12 V supply on and off hundreds of thousands of times a second, with the inductor and capacitor after it smoothing the chopped square wave into steady low-voltage DC. Running the phases out of step with each other means their individual ripples partly cancel, and the current each must carry is divided down to something a single component can survive.',
        'Chopping rather than resisting is the key idea. A resistor dropping 12 V to 1 V would waste eleven twelfths of the energy as heat; a switching converter is better than 90% efficient because the transistors are either fully on or fully off, and neither state dissipates much.',
        'These components get genuinely hot and are a common failure point. That is why the cooler usually has a separate contact path and thermal pads just for this strip of the board.',
      ],
      specs: [
        { label: 'Input', value: '12 V from the PSU' },
        { label: 'Output', value: '~0.7 – 1.1 V, up to ~500 A' },
        { label: 'Phases', value: '12 – 24, interleaved' },
        { label: 'Switching', value: 'Several hundred kHz' },
      ],
      analogy:
        'Not one firehose but twenty garden hoses, opened in turn so the flow never pulses and no single hose bursts.',
    },
    {
      id: 'power-connector',
      name: 'Power Connector',
      category: 'power',
      layer: 7,
      position: [0.6, 1.36, 0.22],
      explode: [1.5, 2.5, 1.2],
      color: '#15181d',
      metalness: 0.3,
      roughness: 0.6,
      shape: [
        { geometry: { type: 'box', size: [1.0, 0.34, 0.34], radius: 0.04 } },
        {
          geometry: { type: 'box', size: [0.08, 0.1, 0.1] },
          offset: [-0.36, 0.06, 0.16],
          repeat: { count: 6, step: [0.144, 0, 0] },
          color: GOLD,
          metalness: 0.9,
          roughness: 0.25,
        },
      ],
      tagline: 'Where most of the card\'s power actually comes from',
      body: [
        'The PCIe slot is only allowed to supply 75 watts. A card that draws three or four hundred has to get the rest directly from the power supply, which is what these pins are for.',
        'The pins are unremarkable; the interesting part is the handful of small signal pins alongside them. The card uses those to ask the power supply what it is capable of before drawing heavily, and a card that is not told it has enough headroom will limit itself rather than risk pulling the supply down.',
        'Contact quality matters more here than anywhere else on the card. Hundreds of watts through a few small contacts means any one of them that is not fully seated carries more than its share, heats up, oxidises, and gets worse — a runaway that has melted connectors on real cards. This is the reason the instructions insist the plug be pushed fully home and not run at a sharp bend.',
      ],
      specs: [
        { label: 'Slot supply limit', value: '75 W' },
        { label: 'Connector supply', value: 'Up to 600 W' },
        { label: 'Sense pins', value: 'Negotiate available headroom' },
      ],
    },
    {
      id: 'pcie-connector',
      name: 'PCIe Edge Connector',
      category: 'connectivity',
      layer: 8,
      position: [-1.75, -1.33, 0],
      explode: [-1.6, -2.0, -0.7],
      color: GOLD,
      metalness: 0.92,
      roughness: 0.22,
      shape: [
        { geometry: { type: 'box', size: [2.1, 0.2, 0.09] } },
        {
          geometry: { type: 'box', size: [0.035, 0.22, 0.1] },
          offset: [-0.95, 0, 0],
          repeat: { count: 22, step: [0.09, 0, 0] },
          color: PCB_DARK,
          metalness: 0.1,
          roughness: 0.8,
        },
      ],
      tagline: 'Sixteen independent lanes, each a pair of wires',
      body: [
        'The gold fingers are the card\'s entire connection to the computer. They are plated rather than bare copper because this is a contact that gets wiped every time the card is inserted, and gold neither corrodes nor builds up an insulating oxide.',
        'PCIe is not a shared bus despite the name. It is a bundle of sixteen independent point-to-point links, and each link is a pair of wires carrying a signal and its exact mirror image. The receiver looks only at the difference between the two, so any interference — which hits both wires nearly equally — subtracts away to almost nothing. That is what makes tens of gigabits per second survive a few centimetres of circuit board.',
        'There is no clock wire. The clock is recovered from the data itself, which is deliberately encoded to guarantee frequent transitions for the receiver to lock onto.',
        'The short set of fingers before the notch is power and housekeeping; the long set behind it is the data lanes. The notch exists so the card cannot be inserted backwards.',
      ],
      specs: [
        { label: 'Lanes', value: '16, point-to-point' },
        { label: 'Signalling', value: 'Differential pairs, clock embedded' },
        { label: 'Bandwidth', value: '~64 GB/s at PCIe 5.0 x16' },
      ],
    },
    {
      id: 'io-bracket',
      name: 'I/O Bracket',
      category: 'connectivity',
      layer: 8,
      position: [-3.28, -0.1, 0.5],
      explode: [-3.6, 0, 0],
      color: NICKEL,
      metalness: 0.88,
      roughness: 0.32,
      shape: [
        { geometry: { type: 'box', size: [0.07, 2.7, 1.55], radius: 0.03 } },
        {
          geometry: { type: 'box', size: [0.14, 0.22, 0.5] },
          offset: [0, -0.75, 0],
          repeat: { count: 3, step: [0, 0.52, 0] },
          color: '#15181d',
          metalness: 0.3,
          roughness: 0.6,
        },
      ],
      tagline: 'The display outputs, and the thing that bolts the card down',
      body: [
        'The bracket does two unrelated jobs. Mechanically it is the only point other than the slot where the card is fixed to the case, and it carries the weight of the far end of a heavy cooler.',
        'Electrically it carries the display outputs. These are not analogue video — they are high-speed serial links much like PCIe, sending compressed or raw pixel data as differential pairs, with the monitor telling the card what resolutions and refresh rates it supports when it is plugged in.',
        'The perforations are not styling either. On cards that exhaust rearwards they are the only path out of the case for that air, and even on cards that do not, they let the bracket act as a vent rather than a wall.',
      ],
      specs: [
        { label: 'Outputs', value: 'DisplayPort and HDMI' },
        { label: 'Signalling', value: 'High-speed serial, differential pairs' },
        { label: 'Second role', value: 'Structural mounting point' },
      ],
    },
    {
      id: 'backplate',
      name: 'Backplate',
      category: 'structure',
      layer: 9,
      position: [-0.6, 0, -0.17],
      explode: [0, 0, -2.4],
      color: '#2b3038',
      metalness: 0.7,
      roughness: 0.42,
      shape: [
        { geometry: { type: 'box', size: [6.0, 2.5, 0.05], radius: 0.05 } },
        {
          geometry: { type: 'box', size: [0.5, 0.11, 0.07] },
          offset: [1.9, -0.6, 0],
          repeat: { count: 5, step: [0, 0.3, 0] },
          color: '#12151a',
        },
      ],
      tagline: 'Mostly structural, and only sometimes a cooler',
      body: [
        'A modern cooler can weigh over a kilogram, hanging off a thin board held at two points. Without a backplate the PCB bows over time, which stresses the solder joints under the die and the memory — a slow failure mode that shows up as instability long after the bending started.',
        'Whether it cools anything depends on how it is fitted. Bolted straight to the board it mainly moves heat around, since the back of a PCB is not where the heat is. Fitted with thermal pads over the areas behind the die and the power stages it does pull real heat out, because those are the spots where the board itself gets hot.',
        'The cut-outs are there to let air leaving the fin stack escape rather than hitting a flat plate and recirculating back into the fans.',
      ],
      analogy: 'The stiff cardboard in the back of a picture frame — mostly there to stop everything sagging.',
    },
  ],
}
