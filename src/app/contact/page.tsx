import React from "react";
import { Metadata } from "next";
import { getSettingsAction } from "../../actions/settings.actions";
import { Phone, Mail, MapPin, MessageCircle, Clock, Sparkles, Facebook, Instagram, Bookmark } from "lucide-react";
import { ContactForm } from "../../components/contact/ContactForm";

export const revalidate = 0; // Fresh load

// Define SEO metadata for Contact Page
export const metadata: Metadata = {
  title: "Contact Our Lead Curators | Maison l'Étoile",
  description: "Connect with our design, tailoring, and COD courier assistance desk. M.M. Alam Road Showroom, Lahore, Pakistan.",
  alternates: {
    canonical: "https://ais-dev-cgwlfgq4uevdr35b2ix4qe-922378778819.asia-southeast1.run.app/contact",
  },
};

export default async function ContactPage() {
  const { settings } = await getSettingsAction();
  
  const email = settings?.contact_email || "support@maisonletoile.com";
  const phone = settings?.contact_phone || "+92 300 1234567";
  const address = settings?.contact_address || "Maison Outlet Building, M.M. Alam Road, Gulberg III, Lahore, Pakistan";
  const whatsapp = settings?.whatsapp_number || "+923001234567";

  const waFormatted = whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`;

  return (
    <div className="bg-neutral-50/50 min-h-screen py-16 text-left" id="contact-page-desk">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block Section */}
        <div className="mb-14 max-w-2xl border-b border-gold-150 pb-8">
          <div className="inline-flex items-center space-x-1.5 bg-neutral-900 text-gold-300 text-[8px] font-display font-medium uppercase tracking-[0.25em] px-3.5 py-1.5 rounded mb-4">
            <Sparkles className="h-3 w-3 text-gold-400" />
            <span>Maison Communication Deck</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-neutral-950 uppercase tracking-tight mb-4">
            Assistance Desk <span className="font-serif italic text-gold-600 font-light">& Support</span>
          </h1>
          <p className="font-sans text-xs text-neutral-500 leading-relaxed">
            Have queries regarding Cash on Delivery courier details, sizing adaptations, or masterwork certificates? Our dedicated curator board is standing by to assist with your inquiries.
          </p>
        </div>

        {/* Master Interactive Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-8">
          
          {/* Left Side: Contact details, business hours, socials */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Direct Coordinates Container */}
            <div className="bg-white border border-gold-150 p-6 sm:p-7 rounded-3xl shadow-sm space-y-6">
              <h3 className="font-display text-[10px] uppercase tracking-widest font-black text-neutral-950 border-b border-neutral-100 pb-3 block">
                Official Channels
              </h3>

              <div className="space-y-5">
                {/* Phone element */}
                <div className="flex items-start space-x-3.5 text-xs">
                  <div className="bg-[#faf9f6] p-2.5 border border-gold-200 rounded-xl text-gold-700">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] uppercase font-bold text-neutral-400 tracking-wider block">
                      HELPLINE COORDINATE
                    </span>
                    <a href={`tel:${phone}`} className="font-sans text-xs font-semibold text-neutral-950 hover:underline">{phone}</a>
                  </div>
                </div>

                {/* Email element */}
                <div className="flex items-start space-x-3.5 text-xs">
                  <div className="bg-[#faf9f6] p-2.5 border border-gold-200 rounded-xl text-gold-700">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] uppercase font-bold text-neutral-400 tracking-wider block">
                      EMAIL LEDGER
                    </span>
                    <a href={`mailto:${email}`} className="font-sans text-xs font-semibold text-neutral-950 hover:underline">{email}</a>
                  </div>
                </div>

                {/* Map/Address element */}
                <div className="flex items-start space-x-3.5 text-xs">
                  <div className="bg-[#faf9f6] p-2.5 border border-gold-200 rounded-xl text-gold-700">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] uppercase font-bold text-neutral-400 tracking-wider block">
                      Physical Showyard
                    </span>
                    <p className="font-sans text-xs text-neutral-700 leading-relaxed font-semibold">{address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business hours Container */}
            <div className="bg-white border border-gold-150 p-6 sm:p-7 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-display text-[10px] uppercase tracking-widest font-black text-neutral-950 border-b border-neutral-100 pb-3 block">
                Office Hours
              </h3>
              
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-neutral-600 font-sans">
                  <span className="font-medium">Monday to Saturday:</span>
                  <span className="text-neutral-950 font-semibold">10:00 AM — 8:00 PM</span>
                </div>
                <div className="flex justify-between items-center text-neutral-650 font-sans pt-1">
                  <span className="font-medium">Sunday Sanctuary:</span>
                  <span className="text-amber-800 bg-amber-50 border border-amber-100 px-2 rounded-full text-[9px] font-black uppercase tracking-wider">Closed</span>
                </div>
              </div>

              <div className="bg-stone-50 border border-gold-100/50 p-4 rounded-xl flex items-start space-x-2 text-neutral-500 text-[11px] font-sans leading-relaxed mt-4">
                <Clock className="h-4 w-4 text-gold-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Our courier dispatch department processes COD parcels from Monday through Saturday. All orders booked on Sunday transit beginning Monday morning.</span>
              </div>
            </div>

            {/* Professional Social Media and Instant WhatsApp CTA Block */}
            <div className="bg-neutral-900 text-white border border-neutral-800 p-6 sm:p-7 rounded-3xl shadow-sm space-y-6">
              
              <div className="space-y-2">
                <span className="font-display text-[8.5px] uppercase tracking-widest text-gold-400 font-bold block">
                  instant customer connection
                </span>
                <h3 className="font-display text-lg uppercase font-black tracking-tight text-white">
                  Social Networks & WhatsApp
                </h3>
                <p className="font-sans text-[11px] text-neutral-400 leading-relaxed">
                  Connect on WhatsApp with our on-duty coordinator for rapid responses, custom sizing consultation, and fabric recommendations.
                </p>
              </div>

              {/* WhatsApp direct CTA */}
              <a
                href={waFormatted}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-display text-[11px] uppercase tracking-widest font-black py-4 px-6 rounded-xl transition-all shadow-sm group"
              >
                <MessageCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                <span>Instant WhatsApp assistance</span>
              </a>

              {/* Technical Social networking links */}
              <div className="pt-2 border-t border-neutral-800">
                <span className="font-display text-[8px] uppercase tracking-widest text-neutral-500 font-bold block mb-3.5">
                  Follow Our Design Houses
                </span>
                
                <div className="flex items-center gap-2.5">
                  <a 
                    href="https://facebook.com/maisonletoile" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 text-[10.5px] text-neutral-300 font-display uppercase tracking-widest hover:text-gold-400 transition-colors bg-neutral-800/80 px-4 py-2.5 rounded-lg border border-neutral-800 hover:border-gold-950/20"
                  >
                    <Facebook className="h-3.5 w-3.5" />
                    <span>Facebook</span>
                  </a>

                  <a 
                    href="https://instagram.com/maisonletoile" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 text-[10.5px] text-neutral-300 font-display uppercase tracking-widest hover:text-gold-400 transition-colors bg-neutral-800/80 px-4 py-2.5 rounded-lg border border-neutral-800 hover:border-gold-950/20"
                  >
                    <Instagram className="h-3.5 w-3.5" />
                    <span>Instagram</span>
                  </a>

                  <a 
                    href="https://pinterest.com/maisonletoile" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 text-[10.5px] text-neutral-300 font-display uppercase tracking-widest hover:text-gold-400 transition-colors bg-neutral-800/80 px-4 py-2.5 rounded-lg border border-neutral-800 hover:border-gold-950/20"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>Pinterest</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Right Side Column: Interactive Form Desk */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

        </div>

      </div>
    </div>
  );
}
