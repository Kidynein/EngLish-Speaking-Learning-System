import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import topicService from '../services/topic.service';
import useDebounce from '../hooks/useDebounce';

const TopicFilterBar = ({ onSearch, onFilterChange, currentFilters, className = '' }) => {
    const [inputValue, setInputValue] = useState(currentFilters.search || '');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Debounce the input for API calls 
    const debouncedSearchTerm = useDebounce(inputValue, 300);
    const wrapperRef = useRef(null);

    // Initial sync
    useEffect(() => {
        setInputValue(currentFilters.search || '');
    }, [currentFilters.search]);

    // Handle outside click to close suggestions
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Fetch Suggestions when debounced term changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!debouncedSearchTerm.trim()) {
                setSuggestions([]);
                return;
            }
            setIsSearching(true);
            try {
                // Fetch top 5 matches
                const results = await topicService.getAllTopics(1, 5, { search: debouncedSearchTerm });
                setSuggestions(results);
            } catch (error) {
                console.error("Failed to fetch suggestions", error);
            } finally {
                setIsSearching(false);
            }
        };

        if (debouncedSearchTerm) {
            fetchSuggestions();
        } else {
            setSuggestions([]);
        }
    }, [debouncedSearchTerm]);

    // Handle form submit (Main Search)
    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        onSearch(inputValue);
    };

    // Handle suggestion click
    const handleSuggestionClick = (topicName) => {
        setInputValue(topicName);
        setShowSuggestions(false);
        onSearch(topicName);
    };

    // Handle Reset
    const handleReset = () => {
        setInputValue('');
        setSuggestions([]);
        onSearch('');
        onFilterChange('level', 'all');
    };

    const hasActiveFilters = inputValue || currentFilters.level !== 'all';

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                {/* Search Bar Container */}
                <div className="relative flex-grow section-search-bar w-full md:w-auto" ref={wrapperRef}>
                    <form onSubmit={handleSubmit} className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className={`h-5 w-5 ${isSearching ? 'text-brand-primary animate-pulse' : 'text-brand-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-10 py-3 border border-slate-600 rounded-xl leading-5 bg-slate-800 placeholder-slate-400 text-white focus:outline-none focus:placeholder-slate-500 focus:border-brand-tertiary focus:ring-2 focus:ring-brand-tertiary/30 transition-all duration-300 sm:text-sm font-medium shadow-sm hover:border-slate-500"
                            placeholder="Find a topic (e.g. Business, Travel)..."
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => {
                                if (inputValue) setShowSuggestions(true);
                            }}
                        />
                        {/* Clear Button */}
                        {inputValue && (
                            <button
                                type="button"
                                onClick={() => {
                                    setInputValue('');
                                    onSearch('');
                                    setSuggestions([]);
                                }}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-brand-primary cursor-pointer transition-colors duration-300"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </form>

                    {/* Dropdown Suggestions */}
                    <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                            <motion.ul
                                initial={{ opacity: 0, y: 5, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                                className="absolute z-50 mt-2 w-full bg-slate-800 shadow-xl max-h-60 rounded-xl py-2 text-base ring-1 ring-slate-700 overflow-auto focus:outline-none sm:text-sm border border-slate-700"
                            >
                                {suggestions.map((topic) => (
                                    <li
                                        key={topic.id}
                                        className="cursor-pointer select-none relative py-3 pl-4 pr-4 hover:bg-brand-primary/20 text-slate-200 transition-colors duration-200 border-b border-slate-700 last:border-0"
                                        onClick={() => handleSuggestionClick(topic.name)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium block truncate text-slate-200">
                                                {topic.name}
                                            </span>
                                            {topic.difficultyLevel && (
                                                <span className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                                                    ${topic.difficultyLevel.toLowerCase() === 'advanced' ? 'bg-red-500/20 text-red-400' :
                                                        topic.difficultyLevel.toLowerCase() === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-brand-primary/20 text-brand-primary'}`}>
                                                    {topic.difficultyLevel}
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </motion.ul>
                        )}
                    </AnimatePresence>
                </div>

                {/* Filters Group */}
                <div className="flex flex-row items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0 min-w-[140px]">
                        <select
                            value={currentFilters.level}
                            onChange={(e) => onFilterChange('level', e.target.value)}
                            className="appearance-none block w-full pl-4 pr-10 py-3 border border-slate-600 bg-slate-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-tertiary/30 focus:border-brand-tertiary sm:text-sm font-medium transition-all duration-300 shadow-sm hover:border-slate-500 cursor-pointer"
                        >
                            <option value="all" className="bg-slate-800">All Levels</option>
                            <option value="beginner" className="bg-slate-800">Beginner</option>
                            <option value="intermediate" className="bg-slate-800">Intermediate</option>
                            <option value="advanced" className="bg-slate-800">Advanced</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-primary">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Reset Button */}
                    <AnimatePresence>
                        {hasActiveFilters && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={handleReset}
                                className="px-4 py-3 text-sm font-medium text-brand-primary bg-brand-primary/20 rounded-xl hover:bg-brand-primary/30 transition-all duration-300 border border-brand-primary/30"
                            >
                                Reset
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default TopicFilterBar;
