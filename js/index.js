const { PI, asin, sin, cos } = Math;
const TO_RAD = PI/180;

const airports = {
	ANC: [ 61.17, -149.99],
	CAY: [  4.82,  -52.36],
	DOH: [ 25.27,   51.61],
	DXB: [ 25.25,   55.37],
	GRU: [-23.43,  -46.47],
	HEL: [ 60.32,   24.97],
	HEM: [ 60.25,   25.04],
	HNL: [ 21.32, -157.92],
	ICN: [ 37.47,  126.44],
	JFK: [ 40.64,  -73.78],
	LAX: [ 33.94, -118.41],
	LHR: [ 51.47,   -0.46],
	MEM: [ 35.04,  -89.98],
	OGG: [ 20.89, -156.44],
	ORY: [ 48.73,    2.37],
	PER: [-31.94,  115.97],
	PPT: [-17.56, -149.61],
	SCL: [-33.39,  -70.79],
	SEA: [ 47.45, -122.31],
	SFO: [ 37.62, -122.38],
	SYD: [-33.95,  151.18],
	YYZ: [ 43.68,  -79.63],
	PVG: [ 31.15,  121.81],
};

const fnsum = (a, b) => a + b;

const parseTime = (time) => time
	.split(':')
	.map((val, i) => val*Math.pow(60, -i))
	.reduce(fnsum);

const praseTimeList = (str) => str
	.trim()
	.split(/\s*\n\s*/)
	.map(parseTime);

const coordToEuclidian = ([ lat, long ]) => {
	const rad = cos( lat*TO_RAD);
	const x   = sin(long*TO_RAD)*rad;
	const y   = sin( lat*TO_RAD);
	const z   = cos(long*TO_RAD)*rad;
	return [ x, y, z ];
};

const coordToAeMap = ([ lat, long ]) => {
	const rad = (90 - lat)/360;
	return [
		0.5 + sin(long*TO_RAD)*rad,
		0.5 + cos(long*TO_RAD)*rad,
	];
};

const aeMapDist = (a, b) => {
	const [ ax, ay ] = coordToAeMap(a);
	const [ bx, by ] = coordToAeMap(b);
	const dx = bx - ax;
	const dy = by - ay;
	return Math.sqrt(dx*dx + dy*dy);
};

const globeDist = (a, b) => {
	const [ ax, ay, az ] = coordToEuclidian(a);
	const [ bx, by, bz ] = coordToEuclidian(b);
	const dx = bx - ax;
	const dy = by - ay;
	const dz = bz - az;
	const chord = Math.sqrt(dx*dx + dy*dy + dz*dz);
	return asin(chord/2)*2;
};

const calcError = (time, dist, scale) => {
	const prediction = scale*time;
	return (dist - prediction)/prediction;
};

const errorToColor = (error) => {
	if (error >= 0) {
		const alpha = Math.max(0, (1 - error*2)*255|0);
		return `rgb(${alpha}, ${alpha}, 255)`;
	}
	const inv = 1/(error + 1) - 1;
	const alpha = Math.max(0, (1 - inv)*255|0);
	return `rgb(255, ${alpha}, ${alpha})`;
};

const processFlights = (flights, calcDist) => {
	let totalTime = 0;
	let totalDist = 0;
	for (const flight of flights) {
		const { times, src, dst } = flight;
		const avgTime = times.reduce(fnsum)/times.length;
		const dist = calcDist(airports[src], airports[dst]);
		totalTime += avgTime;
		totalDist += dist;
		flight.avgTime = avgTime;
		flight.dist = dist;
	}
	const scale = totalDist/totalTime;
	for (const flight of flights) {
		const { name, avgTime, dist, src, dst } = flight;
		const error = calcError(
			avgTime,
			dist,
			scale,
		);
		const color = errorToColor(error*2);
		console.log(` - %c${name} (${src}-${dst}): ${(error*100).toFixed(1)}% off`, `color: ${color}`);
	}
};

const flights = [
	{
		name: 'QTR780',
		times: praseTimeList(`
			13:08
			13:21
			13:17
			13:10
			13:09
			13:22
			13:05
		`),
		src: 'GRU',
		dst: 'DOH',
	}, {
		name: 'FWI70Q',
		times: praseTimeList(`
			08:29
			08:25
			08:43
			08:34
		`),
		src: 'ORY',
		dst: 'CAY',
	}, {
		name: 'FDX1413',
		times: praseTimeList(`
			08:19
			08:19
			08:03
			08:02
			08:12
		`),
		src: 'MEM',
		dst: 'HNL',
	}, {
		name: 'UA863',
		times: praseTimeList(`
			14:10
			13:42
			14:02
			13:43
			13:46
			14:34
			14:45
		`),
		src: 'SFO',
		dst: 'SYD',
	}, {
		name: 'VIR9M',
		times: praseTimeList(`
			07:45
			07:47
			07:42
			07:24
			07:35
			07:43
		`),
		src: 'LHR',
		dst: 'JFK',
	}, {
		name: 'QFA11',
		times: praseTimeList(`
			13:12
			13:13
			13:25
			13:00
		`),
		src: 'SYD',
		dst: 'LAX',
	}, {
		name: 'FIN15',
		times: praseTimeList(`
			08:38
			08:53
			08:52
			08:47
			08:48
			08:43
			08:33
		`),
		src: 'HEL',
		dst: 'JFK',
	}, {
		name: 'KE251',
		times: praseTimeList(`
			07:29
			07:15
		`),
		src: 'ICN',
		dst: 'ANC',
	}, {
		name: 'EK420',
		times: praseTimeList(`
			10:15
			10:23
			10:13
		`),
		src: 'DXB',
		dst: 'PER',
	}, {
		name: 'HA30',
		times: praseTimeList(`
			05:45
			05:24
			05:02
			05:03
			05:15
			05:19
			05:23
		`),
		src: 'OGG',
		dst: 'SEA',
	}, {
		name: 'UA115',
		times: praseTimeList(`
			08:14
			07:59
			07:57
			08:06
			08:06
		`),
		src: 'SFO',
		dst: 'PPT',
	}, {
		name: 'CES7208',
		times: praseTimeList(`
			13:52
			14:15
			14:20
		`),
		src: 'YYZ',
		dst: 'PVG',
	}
];

console.log('Sphere:');
processFlights(flights, globeDist);
console.log('AE Map:');
processFlights(flights, aeMapDist);
