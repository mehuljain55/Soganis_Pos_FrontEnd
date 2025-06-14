import React, { useState } from 'react';
import styles from './InfoPage.module.css';
import { Phone, MapPin, User, FileText, Shirt, Menu, X, ChevronRight } from 'lucide-react';
import SHOP_OUTSIDE_IMAGE_1 from '../Icon/shop_outside1.jpg';
import SHOP_OUTSIDE_IMAGE_2 from '../Icon/shop_outside2.jpg';
import SHOP_INSIDE_IMAGE_1 from '../Icon/shop_inside1.jpg';
import SHOP_INSIDE_IMAGE_2 from '../Icon/shop_inside2.jpg';

const InfoPage = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sections = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact' }
  ];

  const shopImages = [
    { src: SHOP_OUTSIDE_IMAGE_1, caption: 'Store Front View', alt: 'Shop Outside View 1' },
    { src: SHOP_OUTSIDE_IMAGE_2, caption: 'External Shop Display', alt: 'Shop Outside View 2' },
    { src: SHOP_INSIDE_IMAGE_1, caption: 'Interior Display Area', alt: 'Shop Inside View 1' },
    { src: SHOP_INSIDE_IMAGE_2, caption: 'Uniform Collection', alt: 'Shop Inside View 2' }
  ];

  const features = [
    'Premium quality fabrics that are comfortable and long-lasting',
    'Perfect fitting for growing children with alteration services',
    'Wide range of uniform styles for different schools',
    'Competitive pricing without compromising on quality',
    'Quick turnaround time for bulk orders',
    'Expert tailoring and customization services'
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className={styles.section}>
            <div className={styles.heroSection}>
              <div className={styles.heroContent}>
                <div className={styles.heroText}>
                  <h1 className={styles.heroTitle}>Quality School Uniforms for Every Student</h1>
                  <p className={styles.heroSubtitle}>Your trusted partner for premium school uniforms in Indore</p>
                  <div className={styles.heroButtons}>
                    <button 
                      className={`${styles.btn} ${styles.btnPrimary}`}
                      onClick={() => setActiveSection('contact')}
                    >
                      Contact Us
                    </button>
                    <button 
                      className={`${styles.btn} ${styles.btnSecondary}`}
                      onClick={() => setActiveSection('gallery')}
                    >
                      View Gallery
                    </button>
                  </div>
                </div>
                <div className={styles.heroImage}>
                  <div className={styles.heroImagePlaceholder}>
                    <Shirt size={120} className={styles.heroIcon} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>About Our Business</h2>
              <div className={styles.sectionDivider}></div>
            </div>
            
            <div className={styles.aboutContent}>
              <div className={styles.aboutText}>
                <p className={styles.aboutIntro}>
                  Welcome to SOGANI NX, your premier destination for high-quality school uniforms in Indore, 
                  Madhya Pradesh. Located in the heart of South Tukoganj at Trade Centre, we have been serving 
                  the educational community for years with dedication and excellence.
                </p>
                
                <p className={styles.aboutDescription}>
                  Our store specializes in manufacturing and supplying durable, comfortable, and affordable 
                  school uniforms for students of all ages. We understand that school uniforms are more than 
                  just clothing - they represent discipline, unity, and pride in education.
                </p>
                
                <div className={styles.featuresSection}>
                  <h3 className={styles.featuresTitle}>What sets us apart:</h3>
                  <div className={styles.featuresGrid}>
                    {features.map((feature, index) => (
                      <div key={index} className={styles.featureItem}>
                        <ChevronRight size={16} className={styles.featureIcon} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <p className={styles.aboutClosing}>
                  We work closely with various schools across Indore to provide uniforms that meet their 
                  specific requirements. Our experienced team ensures that every uniform is crafted with 
                  attention to detail and meets the highest standards of quality.
                </p>
                
                <div className={styles.businessInfo}>
                  <div className={styles.infoCard}>
                    <FileText className={styles.infoIcon} />
                    <div>
                      <span className={styles.infoLabel}>GST No:</span>
                      <span className={styles.infoValue}>23AFEPS1651L1ZD</span>
                    </div>
                  </div>
                  <div className={styles.infoCard}>
                    <User className={styles.infoIcon} />
                    <div>
                      <span className={styles.infoLabel}>Managed by:</span>
                      <span className={styles.infoValue}>Manish Sogani</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Shop Photos</h2>
              <div className={styles.sectionDivider}></div>
            </div>
            
            <div className={styles.galleryGrid}>
              {shopImages.map((image, index) => (
                <div key={index} className={styles.galleryItem}>
                  <div className={styles.galleryImageContainer}>
                    <img 
                      src={image.src} 
                      alt={image.alt} 
                      className={styles.galleryImage}
                    />
                    <div className={styles.galleryOverlay}>
                      <p className={styles.galleryCaption}>{image.caption}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <p className={styles.galleryNote}>
              Visit our store to see our complete uniform collection and get expert fitting assistance
            </p>
          </div>
        );

      case 'contact':
        return (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Contact Us</h2>
              <div className={styles.sectionDivider}></div>
            </div>
            
            <div className={styles.contactContent}>
              <div className={styles.contactInfo}>
                <div className={styles.contactCard}>
                  <div className={styles.contactIconWrapper}>
                    <MapPin className={styles.contactIcon} />
                  </div>
                  <div className={styles.contactDetails}>
                    <h3>Shop Address</h3>
                    <p>
                      UG 17, Hotel Crown Place<br />
                      Jain Samvsharan Mandir ke Samne<br />
                      18, Road, Trade Centre<br />
                      South Tukoganj, Indore<br />
                      Madhya Pradesh 452001
                    </p>
                  </div>
                </div>
                
                <div className={styles.contactCard}>
                  <div className={styles.contactIconWrapper}>
                    <Phone className={styles.contactIcon} />
                  </div>
                  <div className={styles.contactDetails}>
                    <h3>Phone</h3>
                    <p>0731 495 7094</p>
                  </div>
                </div>
                
                <div className={styles.contactCard}>
                  <div className={styles.contactIconWrapper}>
                    <User className={styles.contactIcon} />
                  </div>
                  <div className={styles.contactDetails}>
                    <h3>Managed By</h3>
                    <p>Manish Sogani</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.mapSection}>
                <div className={styles.mapPlaceholder}>
                  <MapPin size={48} className={styles.mapIcon} />
                  <h3>Our Location</h3>
                  <p>Trade Centre, South Tukoganj</p>
                  <p>Indore, Madhya Pradesh</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <Shirt className={styles.logoIcon} />
            <span className={styles.logoText}>SOGANI NX</span>
          </div>
          
          <nav className={styles.nav}>
            {sections.map((section) => (
              <button
                key={section.id}
                className={`${styles.navItem} ${activeSection === section.id ? styles.active : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </nav>
          
          <button 
            className={styles.mobileMenuToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            {sections.map((section) => (
              <button
                key={section.id}
                className={`${styles.mobileNavItem} ${activeSection === section.id ? styles.active : ''}`}
                onClick={() => {
                  setActiveSection(section.id);
                  setMobileMenuOpen(false);
                }}
              >
                {section.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {renderSection()}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>SOGANI NX</h3>
            <p className={styles.footerTagline}>Quality uniforms for quality education</p>
          </div>
          
          <div className={styles.footerSection}>
            <div className={styles.footerInfo}>
              <p>GST No: 23AFEPS1651L1ZD</p>
              <p>Phone: 0731 495 7094</p>
              <p>Managed by: Manish Sogani</p>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p>&copy; 2025 SOGANI NX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default InfoPage;