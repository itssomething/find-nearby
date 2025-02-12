function generateRandomCoordinate(centerLat, centerLon, radiusKm) {
    const R = 6371;
    const radiusInRadian = radiusKm / R;
    const centerLatRad = centerLat * Math.PI / 180;
    const centerLonRad = centerLon * Math.PI / 180;
    const u = Math.random();
    const v = Math.random();
    const w = radiusInRadian * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);
    const newLatRad = Math.asin(Math.sin(centerLatRad) * Math.cos(w) + Math.cos(centerLatRad) * Math.sin(w) * Math.cos(t));
    const newLonRad = centerLonRad + Math.atan2(Math.sin(t) * Math.sin(w) * Math.cos(centerLatRad), Math.cos(w) - Math.sin(centerLatRad) * Math.sin(newLatRad));
    const newLat = newLatRad * 180 / Math.PI;
    const newLon = newLonRad * 180 / Math.PI;
    return [newLat, newLon];
}

const centerLat = 21.026899;
const centerLon = 105.788692;
const radiusKm = 20;

const specialties = [
    'General Practice', 'Pediatrics', 'Cardiology', 'Dermatology', 'Neurology',
    'Orthopedics', 'Ophthalmology', 'ENT', 'Psychiatry', 'Dentistry'
];

const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Emma', 'James', 'Olivia', 'William', 'Sophia'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

// First, delete existing data
console.log('DELETE FROM doctors;');

// Generate inserts in batches of 50
const batchSize = 50;
const totalDoctors = 1000;
const batches = Math.ceil(totalDoctors / batchSize);

for (let batch = 0; batch < batches; batch++) {
    const values = [];
    const start = batch * batchSize;
    const end = Math.min(start + batchSize, totalDoctors);

    for (let i = start; i < end; i++) {
        const [lat, lon] = generateRandomCoordinate(centerLat, centerLon, radiusKm);
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const specialty = specialties[Math.floor(Math.random() * specialties.length)];
        const phoneNumber = `+84${Math.floor(Math.random() * 900000000 + 100000000)}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

        values.push(`('Dr. ${firstName} ${lastName}', '${specialty}', '${Math.floor(Math.random() * 999 + 1)} Street, Hanoi', ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326), '${phoneNumber}', '${email}')`);
    }

    console.log(`INSERT INTO doctors (name, specialty, address, location, phone, email) VALUES\n${values.join(',\n')};`);
}
