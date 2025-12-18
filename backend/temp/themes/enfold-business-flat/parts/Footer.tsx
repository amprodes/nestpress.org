import React from 'react';
import { Menu, Widget, HeaderSettings } from '../../../types';

export interface FooterProps {
  footerMenu?: Menu;
  footerWidgets?: Widget[];
  header?: HeaderSettings;
}

export const Footer: React.FC<FooterProps> = ({ footerMenu, footerWidgets, header }) => {
  const menuItems = (footerMenu?.items || []).sort((a, b) => a.order - b.order);
  const siteName = header?.siteName || 'Site Name';
  const currentYear = new Date().getFullYear();

  return (
    <>{/* Original footer HTML structure preserved */}
      
                    <div className="container">

                        <span className="copyright">© Copyright  - <a href="https://kriesi.at/themes/enfold-business-flat/">Enfold Flat Business Demo</a> - <a href="https://kriesi.at">Enfold WordPress Theme by Kriesi</a></span>

                        {/* TODO: Replace with dynamic menu */}
      <nav className="sub_menu_socket" role="navigation" itemscope="itemscope" itemtype="https://schema.org/SiteNavigationElement"><div className="avia3-menu"><ul role="menu" className="menu" id="avia3-menu"><li role="menuitem" id="menu-item-451" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-top-level menu-item-top-level-1"><a href="https://kriesi.at/themes/enfold-business-flat/service/" itemprop="url" tabindex="0"><span className="avia-bullet"></span><span className="avia-menu-text">Service</span><span className="avia-menu-fx"><span className="avia-arrow-wrap"><span className="avia-arrow"></span></span></span></a></li>
<li role="menuitem" id="menu-item-452" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-top-level menu-item-top-level-2"><a href="https://kriesi.at/themes/enfold-business-flat/about/" itemprop="url" tabindex="0"><span className="avia-bullet"></span><span className="avia-menu-text">About</span><span className="avia-menu-fx"><span className="avia-arrow-wrap"><span className="avia-arrow"></span></span></span></a></li>
<li role="menuitem" id="menu-item-453" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-top-level menu-item-top-level-3"><a target="_blank" href="https://kriesi.at/privacy-policy" itemprop="url" tabindex="0"><span className="avia-bullet"></span><span className="avia-menu-text">Privacy Policy</span><span className="avia-menu-fx"><span className="avia-arrow-wrap"><span className="avia-arrow"></span></span></span></a></li>
</ul></div></nav>
                    </div>

	            {/* ####### END SOCKET CONTAINER ####### */}
				
      
      {/* Dynamic Footer Menu Injection */}
      {menuItems.length > 0 && (
        <nav className="footer-menu">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                <a href={item.url} target={item.target || '_self'}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      
      {/* Dynamic Widget Areas */}
      {footerWidgets && footerWidgets.length > 0 && (
        <div className="footer-widgets">
          {footerWidgets.map((widget) => (
            <div key={widget.id} className="footer-widget">
              <h3>{widget.title}</h3>
              <div dangerouslySetInnerHTML={{ __html: widget.content }} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};
