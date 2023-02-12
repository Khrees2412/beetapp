import { supabase } from "@/lib/supabase";
import { useRouter } from "next/router";
import React, { useState } from "react";

interface IRegister {
    username: string;
    email: string;
    password: string;
}

const Auth: React.FC = () => {
    const [user, setUser] = useState<IRegister>({
        username: "",
        email: "",
        password: "",
    });

    const { push } = useRouter();

    const { email, password } = user;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) push("/");

            if (data.user) {
                const { error } = await supabase.from("user").insert([
                    {
                        auth_id: data.user.id,
                        username: user.username,
                        email: user.email,
                    },
                ]);
                if (error) throw error;
                setUser({
                    username: "",
                    email: "",
                    password: "",
                });
            }
        } catch (error) {
            alert(error);
        }
    };
    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    return (
        <div className="border rounded-lg p-12 w-4/12 mx-auto my-48">
            <h3 className="font-extrabold text-3xl">Welcome to Beet</h3>

            <p className="text-gray-500 text-sm mt-4">
                Enter Email and Password to Sign Up
            </p>

            <form onSubmit={handleSubmit}>
                <div className="my-3">
                    <label htmlFor="username" className="">
                        Choose a username
                    </label>
                    <input
                        required
                        type="text"
                        name="username"
                        onChange={handleChange}
                        placeholder="Your username"
                        className="border w-full p-3 rounded-lg mt-4 focus:border-indigo-500"
                    />
                </div>

                <div className="my-3">
                    <label htmlFor="email" className="">
                        Email
                    </label>
                    <input
                        required
                        type="email"
                        name="email"
                        onChange={handleChange}
                        placeholder="Your email address"
                        className="border w-full p-3 rounded-lg mt-4 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        required
                        type="password"
                        name="password"
                        onChange={handleChange}
                        placeholder="Password"
                        className="border w-full p-3 rounded-lg mt-4 focus:border-indigo-500"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-indigo-500 text-white w-full p-3 rounded-lg mt-8 hover:bg-indigo-700"
                >
                    Let's go!
                </button>
            </form>
        </div>
    );
};

export default Auth;
