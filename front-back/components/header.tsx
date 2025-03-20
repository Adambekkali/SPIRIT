import AuthButton from "@/components/auth-button";
import Link from "next/link";

const Header = () => {
    return (
        <header className="
            flex justify-between items-center
            m-4 p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg rounded-md">
            <Link href="/" className="text-white text-4xl font-bold ">
              SPIRIT
            </Link>
            <div className="flex items-center gap-4">
                liens
            </div>
            <div className="flex items-center gap-4">
                <AuthButton />
            </div>
        </header>
    );
};

export default Header;
