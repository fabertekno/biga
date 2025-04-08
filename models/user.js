const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    phone: { 
        type: String, 
        required: true, 
        unique: true, 
        match: [/^\d{10}$/, "Phone number must be exactly 10 digits"] 
    },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["admin", "customer"] },
    customerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Customer", 
        required: function() { return this.role === 'customer'; }
    },
});

// Hash the password before saving the user
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare entered password with the stored password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to return user data excluding password (for profile route)
userSchema.methods.toProfileJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
