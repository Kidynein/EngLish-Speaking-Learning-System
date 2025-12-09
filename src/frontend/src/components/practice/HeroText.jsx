const HeroText = ({ text }) => {
    return (
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-center leading-tight tracking-tight px-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-gray-800 to-gray-600 drop-shadow-sm">
                {text}
            </span>
        </h1>
    );
};

export default HeroText;
