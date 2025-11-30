import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isSignUpSuccessPopup, setIsSignUpSuccessPopup] = useState(false);
  const [isSignInSuccessPopup, setIsSignInSuccessPopup] = useState(false);
  const { user, logout } = useAuth();

  const openSignInModal = () => {
    setIsSignUpMode(false); 
    setShowAuth(true);
  };

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="font-bold text-xl text-gray-900">SkillSwap</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="sm:hidden p-2 text-gray-700"
              onClick={() => setOpen(!open)}
            >
              ☰
            </button>

            
            <div
              className={`${
                open ? "flex" : "hidden"
              } flex-col sm:flex sm:flex-row sm:items-center gap-4`}
            >
              <Link to="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>

              
              {user && (
                <>
                  <Link to="/classroom" className="text-gray-700 hover:text-blue-600">
                    Classroom
                  </Link>
                  <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                    Dashboard
                  </Link>
                  
                  {/* Show Admin link only for admin users */}
                  {user.role === "admin" && (
                    <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-semibold">
                      Admin
                    </Link>
                  )}
                </>
              )}

              
              {!user ? (
                <button
                  onClick={openSignInModal}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Sign In
                </button>
              ) : (
                <button
                  onClick={() => {
                    logout();
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        isSignUpInitial={isSignUpMode}
        setIsSignUpSuccessPopup={setIsSignUpSuccessPopup} 
        setIsSignInSuccessPopup={setIsSignInSuccessPopup}
      />

      {isSignUpSuccessPopup && (
        <div className="fixed top-5 right-5 z-50 bg-green-100 border border-green-400 rounded-lg text-green-700 p-4 shadow-md transition-transform transform duration-300 ease-in-out">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium">Sign Up Successful! Please sign in now.</p>
          </div>
        </div>
      )}

      {/* Success Pop-up Message for Sign In */}
      {isSignInSuccessPopup && (
        <div className="fixed top-5 right-5 z-50 bg-blue-100 border border-blue-400 rounded-lg text-blue-700 p-4 shadow-md transition-transform transform duration-300 ease-in-out">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium">Sign In Successful! Welcome back.</p>
          </div>
        </div>
      )}
    </>
  );
}