import React from 'react';
import { Import, Download, Activity, FileCode } from 'lucide-react';

const Tools: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-normal text-gray-800">Tools</h1>

      <div className="bg-white p-6 border border-gray-300 shadow-sm max-w-4xl">
         <h2 className="text-lg font-medium text-gray-800 mb-4">Available Tools</h2>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 p-4 rounded hover:border-[#2271b1] cursor-pointer group">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Import size={20} />
                    </div>
                    <h3 className="font-semibold text-gray-800">Import</h3>
                </div>
                <p className="text-sm text-gray-600">Import posts and comments from other systems like Blogger, RSS, or WordPress.</p>
            </div>

            <div className="border border-gray-200 p-4 rounded hover:border-[#2271b1] cursor-pointer group">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Download size={20} />
                    </div>
                    <h3 className="font-semibold text-gray-800">Export</h3>
                </div>
                <p className="text-sm text-gray-600">Export your content in XML format to move to another WordPress site.</p>
            </div>

            <div className="border border-gray-200 p-4 rounded hover:border-[#2271b1] cursor-pointer group">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-50 text-green-600 rounded group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <Activity size={20} />
                    </div>
                    <h3 className="font-semibold text-gray-800">Site Health</h3>
                </div>
                <p className="text-sm text-gray-600">Check your site's health status and get recommendations for improvements.</p>
            </div>

            <div className="border border-gray-200 p-4 rounded hover:border-[#2271b1] cursor-pointer group">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <FileCode size={20} />
                    </div>
                    <h3 className="font-semibold text-gray-800">Theme File Editor</h3>
                </div>
                <p className="text-sm text-gray-600">Directly edit your theme's CSS and PHP files. Recommended for advanced users only.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Tools;