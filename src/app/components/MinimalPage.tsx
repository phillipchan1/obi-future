import { useState } from 'react';
import { Link } from 'react-router';
import { Bot, Clock, ExternalLink, Play, Youtube, ChevronDown, ChevronUp } from 'lucide-react';

const persona = {
  name: "Phil Chan",
  role: "Senior Product Manager",
};

const items: {
  id: number;
  type: 'course' | 'video';
  title: string;
  source: string;
  duration: string;
  reason: string;
  url?: string;
  thumbnailColor?: string;
}[] = [
  {
    id: 1,
    type: 'course',
    title: "Getting Started with Microsoft Copilot",
    source: "LinkedIn Learning",
    duration: "32 min",
    reason: "Your on-ramp to AI tools. Everything else builds on this — do it first."
  },
  {
    id: 2,
    type: 'course',
    title: "Prompting: The Basics",
    source: "Obi · Prompt Mastery Path",
    duration: "15 min",
    reason: "Prompting is a PM skill. These frameworks map directly to how you write briefs for engineers."
  },
  {
    id: 3,
    type: 'course',
    title: "Explore MS Copilot Fundamentals for Everyday Tasks",
    source: "Microsoft",
    duration: "33 min",
    reason: "Maps directly to your daily work: emails, meeting summaries, document drafting."
  },
  {
    id: 4,
    type: 'video',
    title: "How I Use AI as a Product Manager (Real Workflows, Not Theory)",
    source: "Lenny's Podcast",
    duration: "58 min",
    url: "https://www.youtube.com/@LennysPodcast",
    thumbnailColor: "from-orange-400 to-red-500",
    reason: "Real PM workflows, not hypothetical. Covers AI-assisted discovery, roadmapping, and stakeholder alignment."
  },
  {
    id: 5,
    type: 'course',
    title: "Copilot Chat: Best Practices & Use Cases",
    source: "Microsoft",
    duration: "30 min",
    reason: "Layer Copilot into standups, retros, and stakeholder updates once you've got the basics."
  },
  {
    id: 6,
    type: 'video',
    title: "Synthesizing 50 User Interviews with AI in 20 Minutes",
    source: "UX Research Explained",
    duration: "22 min",
    url: "https://www.youtube.com/@UXResearchExplained",
    thumbnailColor: "from-teal-400 to-cyan-600",
    reason: "Most immediately actionable video on your list. Try the method on your next research batch."
  }
];

function ReasonToggle({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 transition-colors"
      >
        <Bot size={12} />
        Why this?
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <p className="mt-1.5 text-xs text-gray-500 italic leading-relaxed pl-4 border-l-2 border-purple-200">
          {text}
        </p>
      )}
    </div>
  );
}

export function MinimalPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-8 max-w-xl mx-auto">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Your AI Learning Plan</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{persona.name}</h1>
        <p className="text-sm text-gray-500">{persona.role} · Learner</p>
        <p className="mt-4 text-sm text-gray-600 leading-relaxed">
          6 picks — courses and videos — ordered by what will move the needle fastest for you right now.
        </p>
      </div>

      {/* List */}
      <div className="max-w-xl mx-auto px-6 py-6 space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
            {/* Number */}
            <div className="flex-shrink-0 w-6 pt-0.5">
              <span className="text-sm text-gray-300 font-medium">{index + 1}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                {item.type === 'video' ? (
                  <span className="flex-shrink-0 mt-0.5 px-1.5 py-0.5 bg-red-50 text-red-500 text-xs rounded font-medium">Video</span>
                ) : (
                  <span className="flex-shrink-0 mt-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-500 text-xs rounded font-medium">Course</span>
                )}
              </div>
              <h3 className="font-medium text-gray-900 text-sm leading-snug mb-1">{item.title}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{item.source}</span>
                <span>·</span>
                <Clock size={11} />
                <span>{item.duration}</span>
              </div>
              <ReasonToggle text={item.reason} />
            </div>

            {/* CTA */}
            <div className="flex-shrink-0 pt-0.5">
              {item.type === 'video' && item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <Play size={11} />
                  Watch
                </a>
              ) : (
                <button className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors font-medium">
                  Start
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="max-w-xl mx-auto px-6 py-6">
        <div className="bg-gray-50 rounded-xl p-5 flex gap-3 items-start">
          <Bot size={16} className="text-purple-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 leading-relaxed italic">
            These 6 picks were ranked specifically for a Senior PM at Learner level (working toward Familiar). Courses 1–3 and 5 are your core stack. Videos 4 and 6 are best on a commute or over lunch.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-between text-xs text-gray-300">
          <span>Updated May 12, 2026</span>
          <Link to="/full" className="flex items-center gap-1 hover:text-gray-500 transition-colors">
            <ExternalLink size={11} />
            See full game plan
          </Link>
        </div>
      </div>
    </div>
  );
}
