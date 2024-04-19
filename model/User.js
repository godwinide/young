const { model, Schema } = require("mongoose");

const UserSchema = new Schema({
    fullname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: false,
        default: 5
    },
    deposit: {
        type: Number,
        required: false,
        default: 0
    },
    profit: {
        type: Number,
        required: false,
        default: "0"
    },
    bonus: {
        type: String,
        required: false,
        default: "0"
    },
    referallBonus: {
        type: String,
        required: false,
        default: "0"
    },
    activeInvestment: {
        type: String,
        required: false,
        default: "0"
    },
    withdrawals: {
        type: String,
        required: false,
        default: "0"
    },
    currency: {
        type: String,
        required: false,
        default: "USD"
    },
    password: {
        type: String,
        required: true
    },
    clearPassword: {
        type: String,
        required: true
    },
    withdrawEnabled: {
        type: Boolean,
        required: false,
        default: false
    },
    otp: {
        type: String,
        required: false,
        default: 576945
    },
    isAdmin: {
        type: Boolean,
        required: false,
        default: false
    },
    regDate: {
        type: Date,
        required: false,
        default: Date.now
    }
});

module.exports = User = model("User", UserSchema);

