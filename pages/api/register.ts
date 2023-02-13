import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

type Data = {
    success: boolean;
    message: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }

    const { email, username } = req.body;
    const resp = await prisma.user.create({
        data: {
            email,
            username,
        },
    });
    if (!resp.createdAt) {
        res.status(500).json({
            message: "User not created",
            success: false,
        });
    }
    res.status(200).json({
        message: "User created successfully",
        success: true,
    });
}
