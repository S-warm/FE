import React, { useState } from 'react';
import { KPICard } from './KPICard';
import { SkeletonLoader, KPICardSkeleton, ChartSkeleton } from './SkeletonLoader';
import { AnimatedModal, AnimatedDropdown, AnimatedDrawer } from './AnimatedModal';
import '../styles/animations.css';

/**
 * Showcase component for all animations
 * Remove or hide this in production
 */
export const AnimationShowcase: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Animation System Showcase
        </h1>

        {/* ============ KPI CARDS ============ */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            1. KPI Cards with Number Animation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Conversion Rate"
              value={68.0}
              unit="%"
              description="Last 30 days"
              trend="up"
              trendValue={5.2}
            />
            <KPICard
              title="Total Users"
              value={250}
              unit="명"
              description="Registered users"
              trend="up"
              trendValue={12.5}
              variant="success"
            />
            <KPICard
              title="Avg. Response Time"
              value={51}
              unit="초"
              description="Last week"
              trend="down"
              trendValue={-8.3}
              variant="warning"
            />
            <KPICard
              title="Error Rate"
              value={3.2}
              unit="%"
              description="Critical issues"
              trend="down"
              trendValue={-2.1}
              variant="error"
            />
          </div>
        </section>

        {/* ============ MODAL ============ */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            2. Animated Modal
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
          >
            Open Modal
          </button>
          <AnimatedModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Confirm Action"
            footer={
              <>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn-primary"
                >
                  Confirm
                </button>
              </>
            }
          >
            <p className="text-gray-600">
              This is a smooth animated modal. Click outside or press ESC to close.
            </p>
            <p className="text-gray-500 text-sm mt-4">
              The modal enters with a scale + fade animation (300ms) and exits the same way.
            </p>
          </AnimatedModal>
        </section>

        {/* ============ DRAWER ============ */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            3. Animated Drawer/Sidebar
          </h2>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="btn-primary"
          >
            Open Drawer
          </button>
          <AnimatedDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            title="Settings"
            position="right"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dark Mode
                </label>
                <input type="checkbox" className="rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notifications
                </label>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <button className="btn-primary w-full mt-6">Save Settings</button>
            </div>
          </AnimatedDrawer>
        </section>

        {/* ============ DROPDOWN ============ */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            4. Animated Dropdown
          </h2>
          <div className="relative inline-block">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="btn-primary"
            >
              Menu ▼
            </button>
            <AnimatedDropdown
              isOpen={isDropdownOpen}
              items={[
                {
                  id: '1',
                  label: 'Edit Profile',
                  onClick: () => {
                    console.log('Edit Profile');
                    setIsDropdownOpen(false);
                  },
                },
                {
                  id: '2',
                  label: 'Settings',
                  onClick: () => {
                    console.log('Settings');
                    setIsDropdownOpen(false);
                  },
                },
                {
                  id: '3',
                  label: 'Logout',
                  onClick: () => {
                    console.log('Logout');
                    setIsDropdownOpen(false);
                  },
                  active: false,
                },
              ]}
              position="bottom"
            />
          </div>
        </section>

        {/* ============ SKELETON LOADERS ============ */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            5. Skeleton Loaders (Shimmer Animation)
          </h2>
          <button
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 3000);
            }}
            className="btn-primary mb-6"
          >
            Simulate Loading
          </button>

          {isLoading ? (
            <>
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                KPI Card Skeletons
              </h3>
              <KPICardSkeleton count={4} />

              <h3 className="text-sm font-medium text-gray-700 mb-4 mt-8">
                Chart Skeleton
              </h3>
              <ChartSkeleton height="300px" />

              <h3 className="text-sm font-medium text-gray-700 mb-4 mt-8">
                Text Skeleton
              </h3>
              <SkeletonLoader type="text" count={3} />
            </>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Click "Simulate Loading" to see skeleton animations
            </div>
          )}
        </section>

        {/* ============ BUTTON ANIMATIONS ============ */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            6. Button Hover & Ripple Effect
          </h2>
          <div className="space-x-4">
            <button className="btn-primary">
              Primary Button
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Secondary Button
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
              Success Button
            </button>
          </div>
        </section>

        {/* ============ TAB ANIMATION ============ */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            7. Tab Navigation Animation
          </h2>
          <TabShowcase />
        </section>

        {/* ============ CARD HOVER ============ */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            8. Card Hover Effect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Card 1', 'Card 2', 'Card 3'].map((title, i) => (
              <div key={i} className="card interactive">
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600">
                  Hover over this card to see elevation and color animation.
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

/**
 * Tab showcase component
 */
const TabShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div>
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
        {activeTab === 'overview' && (
          <p>Overview content - The tab indicator slides smoothly</p>
        )}
        {activeTab === 'analytics' && (
          <p>Analytics content - Notice the underline animation</p>
        )}
        {activeTab === 'settings' && (
          <p>Settings content - All animations use cubic-bezier easing</p>
        )}
      </div>
    </div>
  );
};

export default AnimationShowcase;
