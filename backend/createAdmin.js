require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await mongoose.connection.collection('users').updateOne(
            { email: 'admin@shop.com' },
            { $set: { name: 'Super Admin', email: 'admin@shop.com', password: hashedPassword, role: 'admin' } },
            { upsert: true }
        );
        console.log('ADMIN CREATED SUCCESSFULLY');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error:', err);
        process.exit(1);
    });
