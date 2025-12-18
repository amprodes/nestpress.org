import React from 'react';
import { Menu, HeaderSettings } from '../../../types';

export interface HeaderProps {
  primaryMenu?: Menu;
  header?: HeaderSettings;
}

export const Header: React.FC<HeaderProps> = ({ primaryMenu, header }) => {
  const menuItems = (primaryMenu?.items || []).sort((a, b) => a.order - b.order);
  const siteName = header?.siteName || 'Site Name';
  const tagline = header?.tagline || '';

  return (
    <>{/* Original HTML structure preserved */}
      

		<div id="header_main" className="container_wrap container_wrap_logo">

        <div className="container av-logo-container"><div className="inner-container"><span className="logo avia-standard-logo"><a href="https://kriesi.at/themes/enfold-business-flat/" className="" aria-label="logo_flat_portfolio" title="logo_flat_portfolio"><img src="https://kriesi.at/themes/enfold-business-flat/wp-content/uploads/sites/43/2014/08/logo_flat_portfolio.png" height="100" width="300" alt="Enfold Flat Business Demo" title="logo_flat_portfolio" /><span className="subtext avia-standard-logo-sub"><img src="https://kriesi.at/themes/enfold-business-flat/wp-content/uploads/sites/43/2014/08/logo_flat_portfolio_white.png" className="alternate avia-standard-logo" alt="" title="logo_flat_portfolio_white" /></span></a></span>{/* TODO: Replace with dynamic menu */}
      <nav className="main_menu" data-selectname="Select a page" role="navigation" itemscope="itemscope" itemtype="https://schema.org/SiteNavigationElement"><div className="avia-menu av-main-nav-wrap"><ul role="menu" className="menu av-main-nav" id="avia-menu"><li role="menuitem" id="menu-item-67" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-home current-menu-item page_item page-item-2 current_page_item menu-item-top-level menu-item-top-level-1"><a href="https://kriesi.at/themes/enfold-business-flat/" itemprop="url" tabindex="0"><span className="avia-bullet"></span><span className="avia-menu-text">Home</span><span className="avia-menu-fx"><span className="avia-arrow-wrap"><span className="avia-arrow"></span></span></span></a></li>
<li role="menuitem" id="menu-item-368" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-top-level menu-item-top-level-2"><a href="https://kriesi.at/themes/enfold-business-flat/service/" itemprop="url" tabindex="0"><span className="avia-bullet"></span><span className="avia-menu-text">Service</span><span className="avia-menu-fx"><span className="avia-arrow-wrap"><span className="avia-arrow"></span></span></span></a></li>
<li role="menuitem" id="menu-item-369" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-top-level menu-item-top-level-3"><a href="https://kriesi.at/themes/enfold-business-flat/contact/" itemprop="url" tabindex="0"><span className="avia-bullet"></span><span className="avia-menu-text">My Work</span><span className="avia-menu-fx"><span className="avia-arrow-wrap"><span className="avia-arrow"></span></span></span></a></li>
<li role="menuitem" id="menu-item-64" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-top-level menu-item-top-level-4"><a href="https://kriesi.at/themes/enfold-business-flat/about/" itemprop="url" tabindex="0"><span className="avia-bullet"></span><span className="avia-menu-text">About</span><span className="avia-menu-fx"><span className="avia-arrow-wrap"><span className="avia-arrow"></span></span></span></a></li>
<li role="menuitem" id="menu-item-66" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-top-level menu-item-top-level-5"><a href="https://kriesi.at/themes/enfold-business-flat/blog/" itemprop="url" tabindex="0"><span className="avia-bullet"></span><span className="avia-menu-text">Blog</span><span className="avia-menu-fx"><span className="avia-arrow-wrap"><span className="avia-arrow"></span></span></span></a></li>
<li role="menuitem" id="menu-item-65" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-top-level menu-item-top-level-6"><a href="https://kriesi.at/themes/enfold-business-flat/contact-2/" itemprop="url" tabindex="0"><span className="avia-bullet"></span><span className="avia-menu-text">Contact</span><span className="avia-menu-fx"><span className="avia-arrow-wrap"><span className="avia-arrow"></span></span></span></a></li>
<li id="menu-item-search" className="noMobile menu-item menu-item-search-dropdown menu-item-avia-special" role="menuitem"><a className="avia-svg-icon avia-font-svg_entypo-fontello" aria-label="Search" href="?s=" rel="nofollow" title="Click to open the search input field" data-avia-search-tooltip="
<search>
	<form role=&quot;search&quot; action=&quot;https://kriesi.at/themes/enfold-business-flat/&quot; id=&quot;searchform&quot; method=&quot;get&quot; className=&quot;&quot;>
		<div>
<span className='av_searchform_search avia-svg-icon avia-font-svg_entypo-fontello' data-av_svg_icon='search' data-av_iconset='svg_entypo-fontello'><svg version=&quot;1.1&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;25&quot; height=&quot;32&quot; viewBox=&quot;0 0 25 32&quot; preserveAspectRatio=&quot;xMidYMid meet&quot; aria-labelledby='av-svg-title-1' aria-describedby='av-svg-desc-1' role=&quot;graphics-symbol&quot; aria-hidden=&quot;true&quot;>
<title id='av-svg-title-1'>Search</title>
<desc id='av-svg-desc-1'>Search</desc>
<path d=&quot;M24.704 24.704q0.96 1.088 0.192 1.984l-1.472 1.472q-1.152 1.024-2.176 0l-6.080-6.080q-2.368 1.344-4.992 1.344-4.096 0-7.136-3.040t-3.040-7.136 2.88-7.008 6.976-2.912 7.168 3.040 3.072 7.136q0 2.816-1.472 5.184zM3.008 13.248q0 2.816 2.176 4.992t4.992 2.176 4.832-2.016 2.016-4.896q0-2.816-2.176-4.96t-4.992-2.144-4.832 2.016-2.016 4.832z&quot;></path>
</svg></span>			<input type=&quot;submit&quot; value=&quot;&quot; id=&quot;searchsubmit&quot; className=&quot;button&quot; title=&quot;Enter at least 3 characters to show search results in a dropdown or click to route to search result page to show all results&quot; />
			<input type=&quot;search&quot; id=&quot;s&quot; name=&quot;s&quot; value=&quot;&quot; aria-label='Search' placeholder='Search' required />
		</div>
	</form>
</search>
" data-av_svg_icon="search" data-av_iconset="svg_entypo-fontello"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="25" height="32" viewBox="0 0 25 32" preserveAspectRatio="xMidYMid meet" aria-labelledby="av-svg-title-2" aria-describedby="av-svg-desc-2" role="graphics-symbol" aria-hidden="true">
<title id="av-svg-title-2">Click to open the search input field</title>
<desc id="av-svg-desc-2">Click to open the search input field</desc>
<path d="M24.704 24.704q0.96 1.088 0.192 1.984l-1.472 1.472q-1.152 1.024-2.176 0l-6.080-6.080q-2.368 1.344-4.992 1.344-4.096 0-7.136-3.040t-3.040-7.136 2.88-7.008 6.976-2.912 7.168 3.040 3.072 7.136q0 2.816-1.472 5.184zM3.008 13.248q0 2.816 2.176 4.992t4.992 2.176 4.832-2.016 2.016-4.896q0-2.816-2.176-4.96t-4.992-2.144-4.832 2.016-2.016 4.832z"></path>
</svg><span className="avia_hidden_link_text">Search</span></a></li><li className="av-burger-menu-main menu-item-avia-special " role="menuitem">
	        			<a href="#" aria-label="Menu" aria-hidden="false">
							<span className="av-hamburger av-hamburger--spin av-js-hamburger">
								<span className="av-hamburger-box">
						          <span className="av-hamburger-inner"></span>
						          <strong>Menu</strong>
								</span>
							</span>
							<span className="avia_hidden_link_text">Menu</span>
						</a>
	        		   </li></ul></div></nav></div> </div> 
		{/* end container_wrap */}
		</div>
<div className="header_bg"></div>
{/* end header */}

      
      {/* Dynamic Menu Injection - Replace static nav with this */}
      {menuItems.length > 0 && (
        <nav className="dynamic-menu">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                <a 
                  href={item.url} 
                  target={item.target || '_self'}
                  className={item.icon ? 'has-icon' : ''}
                >
                  {item.icon && <span className="menu-icon">{item.icon}</span>}
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
};
