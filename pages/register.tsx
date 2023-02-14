import { supabase } from "@/lib/supabase";
import { Dialog } from "@headlessui/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import axios from "axios";

interface IRegister {
    username: string;
    email: string;
    password: string;
}

const Register: React.FC = () => {
    let [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<IRegister>({
        username: "",
        email: "",
        password: "",
    });

    const { push } = useRouter();

    const { email, password, username } = user;

    const handleSubmit = async (e: React.FormEvent) => {
        if (!username) return alert("Please enter a username");

        e.preventDefault();

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) console.error(error);
            setIsOpen(true);

            if (data.user) {
                await axios.post("/api/register", {
                    username,
                    email: data.user.email,
                });
                push("/");
                setUser({
                    username: "",
                    email: "",
                    password: "",
                });
            }
        } catch (error) {
            console.error(error);
        }
    };
    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    return (
        <div className="border border-black rounded-lg p-12 w-4/12 mx-auto my-48 bg-secondary">
            <div className="text-center mb-10">
                <h3 className="font-extrabold text-3xl">Welcome to Beet</h3>

                <p className="text-gray-500 text-sm mt-4">
                    Enter Email and Password to Sign Up
                </p>
            </div>

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
                    Let&apos;s go!
                </button>
            </form>

            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                className="relative z-50 p-20"
            >
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-sm rounded bg-white">
                        <Dialog.Title>Verification Link Sent!</Dialog.Title>
                        <Dialog.Description>
                            We sent a verification link to your email address.
                            Please check your inbox and click the link to verify
                            your account.
                        </Dialog.Description>

                        <button onClick={() => setIsOpen(false)}>Close</button>
                        {/* link to open email client */}
                        <a href="mailto:">Open Email</a>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
};

export default Register;
