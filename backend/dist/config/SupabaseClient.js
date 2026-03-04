"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const supabase_js_1 = require("@supabase/supabase-js");
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is not set');
}
const supabaseKey = process.env.SUPABASE_SERVICE;
if (!supabaseKey) {
    throw new Error('SUPABASE_SERVICE environment variable is not set');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});
