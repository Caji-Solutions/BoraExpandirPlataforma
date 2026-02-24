import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE;

if (!url || !key) {
    throw new Error("Missing Supabase credentials");
}

const s = createClient(url, key);

async function check() {
    const email = "testeju@gmail.com";
    const { data: initialUsers } = await s.auth.admin.listUsers();
    const u1 = initialUsers.users.find((x: any) => x.email === email);
    console.log("metadata Before:", u1?.user_metadata);

    await s.auth.admin.updateUserById(u1!.id, {
        user_metadata: { ...u1!.user_metadata, senha: "testepassword123" }
    });

    const { data: finalUsers } = await s.auth.admin.listUsers();
    const u2 = finalUsers.users.find((x: any) => x.email === email);
    console.log("metadata After update:", u2?.user_metadata);
}

check();
