import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types"


export const ThemeContext = createContext({
    currentTheme: "light",
    theme: {
        light: {
            colorTextPrimary: "text-black",
            colorTextSecondary: "text-gray-500",
            bgColor: "bg-slate-100",
            bgColorChat: "bg-blue-100",
            bgColorHeader: "bg-slate-300",
            bgColorBubChat1: "bg-blue-200",
            bgColorBubChat2: "bg-gray-100"
        },
        dark: {
            colorTextPrimary: "text-[#ffffffde]",
            colorTextSecondary: "text-gray-500",
            bgColor: "bg-[#242424]",
            bgColorBtn: "bg-[#1a1a1a]",
            bgColorChat: "bg-[#282639]",
            bgColorHeader: "bg-[#3a384c]",
            bgColorBubChat1: "bg-pink-900",
            bgColorBubChat2: "bg-gray-700"
        }
    },
    setCurrentTheme: () => { }
})

export function ThemeProvider(props) {
    const { children } = props;
    const [currentTheme, setCurrentTheme] = useState("dark");

    useEffect(() => {
        const localTheme = localStorage.getItem("theme");
        if (!localTheme) {
            localStorage.setItem("theme", "dark");
        } else if (localTheme === "dark" || localTheme === "light") {
            setCurrentTheme(localTheme)
        }
    }, [])

    const changeTheme = () => {
        setCurrentTheme((appliedTheme) => {
            let newTheme = appliedTheme === "dark" ? "light" : "dark";
            localStorage.setItem("theme", newTheme);
            return newTheme;
        })
    }

    return (
        <ThemeContext.Provider value={{
            currentTheme: currentTheme,
            theme: {
                light: {
                    colorTextPrimary: "text-black",
                    colorTextSecondary: "bg-gray-500",
                    bgColor: "bg-slate-100",
                    bgColorChat: "bg-blue-100",
                    bgColorHeader: "bg-slate-300",
                    bgColorBubChat1: "bg-blue-300",
                    bgColorBubChat2: "bg-gray-300"
                },
                dark: {
                    colorTextPrimary: "text-black",
                    colorTextSecondary: "bg-gray-500",
                    bgColor: "bg-slate-100",
                    bgColorChat: "bg-blue-100",
                    bgColorHeader: "bg-slate-300",
                    bgColorBubChat1: "bg-blue-300",
                    bgColorBubChat2: "bg-gray-300"
                }
            },
            changeTheme: changeTheme
        }}>
            {children}
        </ThemeContext.Provider>
    )
}

ThemeProvider.propTypes = {
    children: PropTypes.any
}