import { motion } from 'framer-motion';

const ProgressBar = ({ current, total }) => {
    const progress = Math.min((current / total) * 100, 100);

    return (
        <div className="w-full max-w-md h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 to-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            />
        </div>
    );
};

export default ProgressBar;
