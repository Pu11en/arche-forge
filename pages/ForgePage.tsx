"use client";
import React from "react";
import { HeroParallax } from "../components/ui/hero-parallax";

export function ForgePage() {
    return (
        <div className="min-h-screen w-full bg-black">
            <HeroParallax products={products} />
        </div>
    );
}

export const products = [
    {
        title: "Moonbeam",
        link: "https://gomoonbeam.com",
        thumbnail:
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop",
    },
    {
        title: "Cursor",
        link: "https://cursor.so",
        thumbnail:
            "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop",
    },
    {
        title: "Rogue",
        link: "https://userogue.com",
        thumbnail:
            "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop",
    },

    {
        title: "Editorially",
        link: "https://editorially.org",
        thumbnail:
            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600&auto=format&fit=crop",
    },
    {
        title: "Editrix AI",
        link: "https://editrix.ai",
        thumbnail:
            "https://images.unsplash.com/photo-1531297461362-76ce1f663801?q=80&w=600&auto=format&fit=crop",
    },
    {
        title: "Pixel Perfect",
        link: "https://app.pixelperfect.quest",
        thumbnail:
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop",
    },

    {
        title: "Algochurn",
        link: "https://algochurn.com",
        thumbnail:
            "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=600&auto=format&fit=crop",
    },
    {
        title: "Aceternity UI",
        link: "https://ui.aceternity.com",
        thumbnail:
            "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=600&auto=format&fit=crop",
    },
    {
        title: "Tailwind Master Kit",
        link: "https://tailwindmasterkit.com",
        thumbnail:
            "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?q=80&w=600&auto=format&fit=crop",
    },
    {
        title: "SmartBridge",
        link: "https://smartbridgetech.com",
        thumbnail:
            "https://images.unsplash.com/photo-1535378437268-dcbbfe0d4a4d?q=80&w=600&auto=format&fit=crop",
    },
    {
        title: "Renderwork Studio",
        link: "https://renderwork.studio",
        thumbnail:
            "https://images.unsplash.com/photo-1581291518857-4e27f4835186?q=80&w=600&auto=format&fit=crop",
    },

    {
        title: "Creme Digital",
        link: "https://cremedigital.com",
        thumbnail:
            "https://images.unsplash.com/photo-1499951360447-b6f6daf84636?q=80&w=600&auto=format&fit=crop",
    },
    {
        title: "Golden Bells Academy",
        link: "https://goldenbellsacademy.com",
        thumbnail:
            "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=600&auto=format&fit=crop",
    },
    {
        title: "Invoker Labs",
        link: "https://invoker.lol",
        thumbnail:
            "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop",
    },
    {
        title: "E Free Invoice",
        link: "https://efreeinvoice.com",
        thumbnail:
            "https://images.unsplash.com/photo-1522542550229-4e9a86a35e46?q=80&w=600&auto=format&fit=crop",
    },
];
