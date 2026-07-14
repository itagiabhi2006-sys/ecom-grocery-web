import { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Facebook, 
  Instagram, 
  Twitter,
  Send
} from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitStatus('success');
      setIsSubmitting(false);
      setFormData({
        name: '', email: '', phone: '', subject: '', message: ''
      });
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Call Us",
      details: ["+91 99028 05132"],
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      link: "tel:+919902805132"
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["support@kirani.in"],
      color: "text-blue-600 bg-blue-50 border-blue-100",
      link: "mailto:support@kirani.in"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["Kittur Karnataka 591115"],
      color: "text-pink-600 bg-pink-50 border-pink-100",
      link: "https://maps.google.com"
    },
    {
      icon: Clock,
      title: "Open Hours",
      details: ["Mon-Sat: 8AM - 10PM"],
      color: "text-purple-600 bg-purple-50 border-purple-100",
      link: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center pt-10 pb-20">
      <div className="w-full max-w-6xl px-6 lg:px-8 mt-4">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Contact Abhishek Itagi
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto font-medium">
            Have a question or need assistance? Reach out to us using the form below or through our contact details.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info, index) => (
            <a
              key={index}
              href={info.link}
              target={info.link.startsWith('http') ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 border ${info.color} group-hover:scale-105 transition-transform duration-300`}>
                <info.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">{info.title}</h3>
              {info.details.map((detail, idx) => (
                <p key={idx} className="text-gray-600 text-sm font-medium">{detail}</p>
              ))}
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm h-full flex flex-col justify-center">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Send a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-800 placeholder-gray-400"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-800 placeholder-gray-400"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-800 placeholder-gray-400"
                    placeholder="How can we help?"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-800 placeholder-gray-400 resize-none"
                    placeholder="Write your message here..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
                
                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <span className="font-bold">✓</span>
                    <p className="text-sm font-medium">Message sent successfully! We'll get back to you soon.</p>
                  </div>
                )}
              </form>
            </div>
          </div>
          
          {/* Side Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Social Connect */}
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Connect With Us</h3>
              <div className="flex justify-center gap-4">
                {[
                  { icon: Facebook, color: "text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-600 hover:text-white", link: "#" },
                  { icon: Instagram, color: "text-pink-600 bg-pink-50 border-pink-100 hover:bg-pink-600 hover:text-white", link: "#" },
                  { icon: Twitter, color: "text-sky-500 bg-sky-50 border-sky-100 hover:bg-sky-500 hover:text-white", link: "#" }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 border ${social.color}`}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Emergency Support */}
            <div className="p-6 rounded-2xl bg-red-50 border border-red-100 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-3">
                <Phone className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Emergency Support</h3>
              <p className="text-gray-600 text-sm font-medium mb-3">24/7 Dedicated Customer Support</p>
              <a 
                href="tel:+919902805132" 
                className="inline-block px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors"
              >
                +91 99028 05132
              </a>
            </div>
            
            {/* Minimal Map Card */}
            <div className="p-2 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden h-[200px]">
              <iframe
                title="Store Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15383.670076295471!2d74.7797762!3d15.5975619!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbfac2f5a60e0a5%3A0xb3df88f3c4db21e0!2sKittur%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                className="rounded-xl border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;