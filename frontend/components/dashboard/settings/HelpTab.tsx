"use client";

import { MessageCircle, Mail, Ticket, ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const faqs = [
    {
        question: 'How do I schedule a meeting?',
        answer: 'You can schedule a meeting by navigating to the "Meet" tab in the sidebar and selecting "Schedule Meeting". Fill in the details and invite your team.'
    },
    {
        question: 'Can I record meetings?',
        answer: 'Yes, meeting recording is available for premium users. You can start recording from the meeting controls once the meeting has started.'
    },
    {
        question: 'How do I invite team members?',
        answer: 'You can invite team members during a meeting via the "Add Participants" button, or by sharing the meeting link directly.'
    },
    {
        question: 'How do I change my password?',
        answer: 'Go to Settings > Account and you will find the "Change Password" section where you can update your security credentials.'
    },
    {
        question: "What's the maximum number of participants in a meeting?",
        answer: 'The standard plan supports up to 50 participants, while the Enterprise plan allows up to 500 participants per meeting.'
    },
];

const HelpTab = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="space-y-6 max-w-4xl text-left">
            {/* FAQ Section */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <HelpCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Frequently Asked Questions</h3>
                </div>

                <div className="space-y-2">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-[#2A3430] last:border-0">
                            <button
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                className="w-full py-4 flex items-center justify-between group"
                            >
                                <span className={`text-sm font-medium transition-colors ${openFaq === index ? 'text-emerald-400' : 'text-gray-300 group-hover:text-white'}`}>
                                    {faq.question}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-emerald-400' : ''}`} />
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-40 pb-4' : 'max-h-0'}`}>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Support */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6 text-left">
                <h3 className="text-lg font-bold text-white mb-6">Contact Support</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-4 p-4 bg-[#15231D] border border-[#2A3430] rounded-xl group hover:border-emerald-500/30 transition-colors">
                        <div className="p-3 rounded-lg bg-emerald-500/5 border border-white/5">
                            <Mail className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white">Email Support</h4>
                            <p className="text-xs text-gray-500">support@WaveTalk.com</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-[#15231D] border border-[#2A3430] rounded-xl group hover:border-emerald-500/30 transition-colors">
                        <div className="p-3 rounded-lg bg-emerald-500/5 border border-white/5">
                            <MessageCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white">Live Chat</h4>
                            <p className="text-xs text-gray-500">Available 24/7</p>
                        </div>
                    </div>
                </div>
                <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                    <Ticket className="w-4 h-4" />
                    Open Support Ticket
                </button>
            </div>
        </div>
    );
};

export default HelpTab;
