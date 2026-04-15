'use client';

// import VisitorCounter from "./VisitorCounter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">College PYQ Hub</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              A one-stop platform for students to access Previous Year Question Papers, 
              Important Questions and Syllabus. Made with ❤️ for easy exam preparation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <div className="space-y-2 text-gray-400">
              <a href="/" className="block hover:text-white transition">Home</a>
              <a href="/pyq" className="block hover:text-white transition">PYQ Papers</a>
              <a href="/important-questions" className="block hover:text-white transition">Important Questions</a>
              <a href="/syllabus" className="block hover:text-white transition">Syllabus</a>
              <a href="/admin" className="block hover:text-white transition">Admin Panel</a>
            </div>
          </div>

          {/* Developer Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Developed By</h4>
            <p className="text-gray-400 text-sm mb-4">
              Utkarsh Singh 526 <br />
              {/* Prayagraj, Uttar Pradesh<br /> */}
              Computer Science Student
            </p>
            {/* <div className="text-gray-400 text-sm mb-4"><p className="text-sm text-green-400 mt-4">
            👥 Total Visitors: <VisitorCounter />
              </p></div> */}

            <div className="flex flex-wrap gap-x-8 gap-y-2 text-lg">
              <a 
                href="https://github.com/Utkarsh-Singh526" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                GitHub
              </a>
              <a 
                href="https://www.linkedin.com/in/utkarsh-singh-79b192243?utm_source=share_via&utm_content=profile&utm_medium=member_android" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                LinkedIn
              </a>
              <a 
                href="mailto:us421514@gmail.com" 
                className="text-gray-400 hover:text-white transition"
              >
                Email
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 College PYQ Hub • Made with ❤️ for Students
          </p>
{/*           
          <p className="text-sm text-green-400 mt-4">
          👥 Total Visitors: <VisitorCounter />
          </p> */}

          <p className="text-xs text-gray-600 mt-6">
            This project is for educational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}