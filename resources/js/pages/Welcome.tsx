import { Head, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Flash, OfflineNotice } from "../components/ui";
import { Navbar } from "../components/landingpage/Navbar";
import { HeroSection } from "../components/landingpage/HeroSection";
import { AlurSection } from "../components/landingpage/AlurSection";
import { FaqSection } from "../components/landingpage/FaqSection";
import { Footer } from "../components/landingpage/Footer";
import type { SharedProps } from "../types";

export default function Welcome() {
    const { auth } = usePage<SharedProps>().props;
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    // Pastikan URL tetap bersih tanpa fragment hash (#alur / #faq)
    useEffect(() => {
        if (window.location.hash) {
            window.history.replaceState(null, "", window.location.pathname);
        }
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-[#f8faf9] text-[#11281e] antialiased flex flex-col font-sans">
            <Head title="Selamat Datang · Sistem Anggota IPNU IPPNU Magetan" />
            <OfflineNotice />

            <Navbar user={auth.user} onScrollTo={scrollToSection} />

            <main id="main" className="flex-1">
                <Flash />
                <HeroSection user={auth.user} />
                <AlurSection />
                <FaqSection openFaq={openFaq} onToggleFaq={toggleFaq} />
            </main>

            <Footer user={auth.user} onScrollTo={scrollToSection} />
        </div>
    );
}
