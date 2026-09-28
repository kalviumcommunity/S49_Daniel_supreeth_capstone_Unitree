// Fills the database with demo data. Only touches accounts ending in @unitree.demo,
// so it is safe to run against a database that already has real users.
// Usage: npm run seed
require("dotenv").config();
const crypto = require("crypto");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Campaign = require("./models/Campaign");
const Donation = require("./models/Donation");
const Post = require("./models/Post");
const Item = require("./models/Item");

const DEMO_DOMAIN = "@unitree.demo";
const PASSWORD = "password123";

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`;

const users = [
    { username: "Asha Rao", email: "asha" + DEMO_DOMAIN, bio: "Community gardener and volunteer.", location: "Bengaluru" },
    { username: "Rahul Mehta", email: "rahul" + DEMO_DOMAIN, bio: "Teacher who loves helping kids learn.", location: "Pune" },
    { username: "Priya Nair", email: "priya" + DEMO_DOMAIN, bio: "Animal lover. Runs a small shelter.", location: "Kochi" },
    { username: "Demo Donor", email: "donor" + DEMO_DOMAIN, bio: "Here to help where I can.", location: "Chennai" },
];

const campaigns = [
    {
        by: 0,
        title: "Help Build a Community Garden",
        summary: "A shared green space where neighbours grow fresh produce together.",
        story: "Our neighbourhood has an empty lot that has been unused for years. We want to turn it into a community garden with raised beds, a water tank and a small tool shed.\n\nEvery family in the area will get a plot, and the extra produce will go to the local food bank. Your donation buys soil, seeds, fencing and tools.",
        category: "Community",
        goal: 5000,
        image: img("photo-1464226184884-fa280b87c399"),
        location: "Bengaluru",
    },
    {
        by: 1,
        title: "Books and Laptops for a Village School",
        summary: "Giving 120 students access to a library and a small computer lab.",
        story: "The government school in our village has no library and no computers. We are raising funds to set up a reading corner with 500 books and a lab with 6 refurbished laptops.\n\nVolunteers from the city will run weekend coding and reading classes.",
        category: "Education",
        goal: 8000,
        image: img("photo-1497633762265-9d179a990aa6"),
        location: "Pune",
    },
    {
        by: 2,
        title: "Animal Shelter Renovation",
        summary: "Upgrading kennels and the vet room to care for more rescue animals.",
        story: "Our shelter houses over 60 dogs and cats rescued from the streets. The roof leaks every monsoon and the vet room needs new equipment.\n\nWith your help we can fix the roof, build 10 new kennels and buy a proper examination table.",
        category: "Animals",
        goal: 20000,
        image: img("photo-1517849845537-4d257902454a"),
        location: "Kochi",
    },
    {
        by: 0,
        title: "Medical Fund for a Local Family",
        summary: "Supporting a family facing unexpected surgery costs.",
        story: "Ravi, a daily wage worker and father of two, needs urgent heart surgery. The family has exhausted their savings.\n\nEvery contribution goes directly to the hospital bill. We will post receipts and updates here.",
        category: "Medical",
        goal: 15000,
        image: img("photo-1576091160550-2173dba999ef"),
        location: "Bengaluru",
    },
];

const items = [
    { by: 1, name: "School textbooks (Grade 8)", description: "Full set of CBSE grade 8 textbooks, lightly used.", category: "Books", condition: "Good", quantity: 1, location: "Pune" },
    { by: 3, name: "Winter jackets", description: "Three warm jackets, adult sizes M and L.", category: "Clothing", condition: "Like new", quantity: 3, location: "Chennai" },
    { by: 3, name: "Study table", description: "Wooden study table with a drawer. Pickup only.", category: "Furniture", condition: "Good", quantity: 1, location: "Chennai" },
    { by: 2, name: "Pressure cooker", description: "5 litre pressure cooker, works perfectly.", category: "Kitchen", condition: "Good", quantity: 1, location: "Kochi" },
];

const run = async () => {
    await connectDB();

    const old = await User.find({ email: { $regex: DEMO_DOMAIN.replace(".", "\\.") + "$" } }).distinct("_id");
    if (old.length) {
        const oldCampaigns = await Campaign.find({ creator: { $in: old } }).distinct("_id");
        await Promise.all([
            Donation.deleteMany({ $or: [{ donor: { $in: old } }, { campaign: { $in: oldCampaigns } }] }),
            Campaign.deleteMany({ creator: { $in: old } }),
            Post.deleteMany({ author: { $in: old } }),
            Item.deleteMany({ donor: { $in: old } }),
            User.deleteMany({ _id: { $in: old } }),
        ]);
        console.log(`Removed previous demo data (${old.length} users)`);
    }

    const createdUsers = [];
    for (const u of users) createdUsers.push(await User.create({ ...u, password: PASSWORD }));

    const createdCampaigns = await Campaign.insertMany(
        campaigns.map(({ by, ...c }) => ({ ...c, creator: createdUsers[by]._id }))
    );

    // A spread of donations from users who are not the campaign creator
    const amounts = [250, 100, 500, 75, 1200, 50, 300];
    for (const [i, campaign] of createdCampaigns.entries()) {
        const donors = createdUsers.filter((u) => !u._id.equals(campaign.creator));
        let raised = 0;
        for (let j = 0; j < 3 + i; j++) {
            const amount = amounts[(i + j) % amounts.length];
            raised += amount;
            await Donation.create({
                campaign: campaign._id,
                donor: donors[j % donors.length]._id,
                amount,
                message: j % 2 ? "Keep going!" : "",
                anonymous: j === 2,
                reference: "UT-" + crypto.randomBytes(5).toString("hex").toUpperCase(),
            });
        }
        await Campaign.updateOne({ _id: campaign._id }, { raised, donationCount: 3 + i });
    }

    await Post.insertMany([
        {
            author: createdUsers[0]._id,
            campaign: createdCampaigns[0]._id,
            title: "The first raised beds are in!",
            content: "Thanks to everyone who donated, we built the first six raised beds this weekend. Twelve families turned up to help fill them with soil.\n\nNext up: the water tank and fencing.",
            coverImage: img("photo-1416879595882-3373a0480b5b"),
            tags: ["update", "garden"],
            likes: [createdUsers[1]._id, createdUsers[3]._id],
            comments: [{ author: createdUsers[3]._id, text: "Looks amazing! Proud to be part of this." }],
        },
        {
            author: createdUsers[2]._id,
            campaign: createdCampaigns[2]._id,
            title: "Meet Bruno, our newest rescue",
            content: "Bruno was found near the highway with an injured leg. After two weeks of care he is walking again and looking for a forever home.\n\nYour donations paid for his treatment. Thank you!",
            coverImage: img("photo-1543466835-00a7907e9de1"),
            tags: ["animals", "rescue"],
            likes: [createdUsers[0]._id],
        },
        {
            author: createdUsers[3]._id,
            title: "Why I started giving every month",
            content: "A year ago I decided to give a small amount every month to causes near me. It changed how I see my neighbourhood.\n\nYou don't need to give a lot. Consistency matters more than size.",
            tags: ["story", "giving"],
        },
    ]);

    await Item.insertMany(items.map(({ by, ...i }) => ({ ...i, donor: createdUsers[by]._id })));

    console.log("Demo data created. Log in with any of these (password: " + PASSWORD + "):");
    users.forEach((u) => console.log("  " + u.email));
    await mongoose.disconnect();
};

run().catch(async (err) => {
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
});
