import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight, Menu, X, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'
import { supabase } from '@/integrations/oracle'
import { toast } from 'sonner'

const menuItems = [
    { name: 'Events', href: '/events' },
    { name: 'Classrooms', href: '/classrooms' },
    { name: 'Clubs', href: '/clubs' },
    { name: 'Analytics', href: '/analytics' },
]

const DashboardHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const navigate = useNavigate()

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut()
            toast.success("Signed out successfully!")
            navigate("/auth")
        } catch (error) {
            toast.error("Error signing out")
        }
    }

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2 group">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12 bg-background/30 rounded-2xl border border-white/10 backdrop-blur-md', isScrolled && 'bg-background/50 max-w-4xl backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                to="/dashboard"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <Logo />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            to={item.href}
                                            className="text-muted-foreground hover:text-white block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                to={item.href}
                                                className="text-muted-foreground hover:text-white block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit [&>*]:not-[.group]">
                                <div className={cn(isScrolled && 'lg:hidden')}>
                                    <button
                                        onClick={handleSignOut}
                                        className="group/button inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative text-primary-foreground bg-primary hover:bg-primary/90 h-9 px-3">
                                        <span className="mr-0 group-hover/button:mr-2 transition-all duration-200">Sign Out</span>
                                        <div className="w-0 overflow-hidden opacity-0 transition-all duration-200 group-hover/button:w-5 group-hover/button:opacity-100">
                                            <LogOut className="h-4 w-4" />
                                        </div>
                                    </button>
                                </div>
                                <div className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}>
                                    <button
                                        onClick={handleSignOut}
                                        className="group/button inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative text-primary-foreground bg-primary hover:bg-primary/90 h-9 px-3">
                                        <span className="mr-0 group-hover/button:mr-2 transition-all duration-200">Sign Out</span>
                                        <div className="w-0 overflow-hidden opacity-0 transition-all duration-200 group-hover/button:w-5 group-hover/button:opacity-100">
                                            <LogOut className="h-4 w-4" />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}

const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn('flex items-center space-x-2', className)}>
            <div className="relative">
                <svg
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5">
                    <path
                        d="M3 0H5V18H3V0ZM13 0H15V18H13V0ZM18 3V5H0V3H18ZM0 15V13H18V15H0Z"
                        fill="url(#logo-gradient)"
                    />
                    <defs>
                        <linearGradient
                            id="logo-gradient"
                            x1="9"
                            y1="0"
                            x2="9"
                            y2="18"
                            gradientUnits="userSpaceOnUse">
                            <stop stopColor="#9B99FE" />
                            <stop
                                offset="1"
                                stopColor="#2BC8B7"
                            />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <span className="text-white text-xl font-bold">EventHub</span>
        </div>
    )
}

export { DashboardHeader }
