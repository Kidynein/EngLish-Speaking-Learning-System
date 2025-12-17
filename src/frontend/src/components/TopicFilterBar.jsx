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
                            <svg className={`h-5 w-5 ${isSearching ? 'text-green-600 animate-pulse' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-10 py-3 border border-green-200 rounded-xl leading-5 bg-white placeholder-green-800 text-green-800 focus:outline-none focus:placeholder-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 sm:text-sm font-medium shadow-sm hover:shadow-md"
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
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-400 hover:text-green-600 cursor-pointer transition-colors"
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
                                className="absolute z-50 mt-2 w-full bg-white shadow-xl max-h-60 rounded-xl py-2 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm border border-gray-100"
                            >
                                {suggestions.map((topic) => (
                                    <li
                                        key={topic.id}
                                        className="cursor-pointer select-none relative py-3 pl-4 pr-4 hover:bg-green-50 text-gray-800 transition-colors duration-150 border-b border-gray-50 last:border-0"
                                        onClick={() => handleSuggestionClick(topic.name)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium block truncate text-gray-700">
                                                {topic.name}
                                            </span>
                                            {topic.difficultyLevel && (
                                                <span className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                                                    ${topic.difficultyLevel.toLowerCase() === 'advanced' ? 'bg-red-100 text-red-700' :
                                                        topic.difficultyLevel.toLowerCase() === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-green-100 text-green-700'}`}>
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
                            className="appearance-none block w-full pl-4 pr-10 py-3 border border-green-200 bg-white text-green-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 sm:text-sm font-medium transition-all shadow-sm hover:border-green-400 hover:shadow-md cursor-pointer"
                        >
                            <option value="all" className="text-gray-600">All Levels</option>
                            <option value="beginner" className="text-green-600 font-medium">Beginner</option>
                            <option value="intermediate" className="text-yellow-600 font-medium">Intermediate</option>
                            <option value="advanced" className="text-red-600 font-medium">Advanced</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-green-600">
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
                                className="px-4 py-3 text-sm font-medium text-green-700 bg-green-50 rounded-xl hover:bg-green-100 hover:text-green-800 transition-colors border border-green-200"
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
