import request from 'supertest';
import app from '../index';
import {
  detectHotspots,
  aggregateAreaIntelligence,
  detectRecurringLocations,
  calculateCategoryTrends,
  calculateHaversineDistanceMeters,
} from '../services/civic/hotspotService';

describe('MakkalSaantru — Civic Intelligence Map & Hotspots Tests', () => {

  describe('1. Geospatial Haversine Distance Calculation', () => {
    it('calculates accurate distance between two nearby coordinates in Trichy', () => {
      // Trichy Central Bus Stand to Collectorate (approx 450m)
      const dist = calculateHaversineDistanceMeters(10.7905, 78.6925, 10.7895, 78.6912);
      expect(dist).toBeGreaterThan(100);
      expect(dist).toBeLessThan(800);
    });

    it('returns 0 meters for identical coordinates', () => {
      const dist = calculateHaversineDistanceMeters(10.7905, 78.6925, 10.7905, 78.6925);
      expect(dist).toBe(0);
    });
  });

  describe('2. Hotspot Detection Service (250m Radius Clustering)', () => {
    it('groups nearby road reports into a single hotspot with HIGH_ATTENTION level', () => {
      const mockReports = [
        { id: 'r1', latitude: 10.7905, longitude: 78.6925, category: 'ROAD', priorityScore: 92, priorityLevel: 'URGENT_REVIEW', status: 'REPORTED', locationText: 'Trichy Bus Stand', independentReportCount: 8, createdAt: new Date() },
        { id: 'r2', latitude: 10.7908, longitude: 78.6927, category: 'ROAD', priorityScore: 88, priorityLevel: 'URGENT_REVIEW', status: 'REPORTED', locationText: 'Trichy Bus Stand', independentReportCount: 5, createdAt: new Date() },
        { id: 'r3', latitude: 10.7902, longitude: 78.6921, category: 'ROAD', priorityScore: 85, priorityLevel: 'URGENT_REVIEW', status: 'ACTION_IN_PROGRESS', locationText: 'Trichy Bus Stand', independentReportCount: 4, createdAt: new Date() },
        { id: 'r4', latitude: 10.7906, longitude: 78.6929, category: 'DRAINAGE', priorityScore: 81, priorityLevel: 'URGENT_REVIEW', status: 'REPORTED', locationText: 'Trichy Bus Stand', independentReportCount: 3, createdAt: new Date() },
        { id: 'r5', latitude: 10.7898, longitude: 78.6918, category: 'ROAD', priorityScore: 79, priorityLevel: 'HIGH', status: 'REPORTED', locationText: 'Trichy Bus Stand', independentReportCount: 2, createdAt: new Date() },
      ];

      const hotspots = detectHotspots(mockReports, 250);

      expect(hotspots.length).toBeGreaterThanOrEqual(1);
      const topHotspot = hotspots[0];

      expect(topHotspot.reportCount).toBe(5);
      expect(topHotspot.dominantCategory).toBe('ROAD');
      expect(topHotspot.highPriorityCount).toBe(5);
      expect(topHotspot.attentionLevel).toBe('HIGH_ATTENTION');
      expect(topHotspot.explainableReasons.length).toBeGreaterThan(0);
      expect(topHotspot.explainableReasons[0]).toContain('concentrated within 250m');
    });

    it('returns empty array when input report list is empty', () => {
      const hotspots = detectHotspots([], 250);
      expect(hotspots).toEqual([]);
    });
  });

  describe('3. Area Intelligence Aggregation', () => {
    it('aggregates reports by locality name and calculates average resolution time', () => {
      const mockReports = [
        { id: 'r1', locationText: 'Demo Ward 12, Trichy', status: 'RESOLVED', priorityScore: 84, priorityLevel: 'HIGH', category: 'ROAD', createdAt: new Date(Date.now() - 4 * 86400000), resolvedAt: new Date(Date.now() - 2 * 86400000) },
        { id: 'r2', locationText: 'Demo Ward 12, Trichy', status: 'REPORTED', priorityScore: 92, priorityLevel: 'URGENT_REVIEW', category: 'ROAD', createdAt: new Date(Date.now() - 6 * 86400000) },
        { id: 'r3', locationText: 'Chatram Locality', status: 'REPORTED', priorityScore: 65, priorityLevel: 'HIGH', category: 'DRAINAGE', createdAt: new Date(Date.now() - 1 * 86400000) },
      ];

      const areas = aggregateAreaIntelligence(mockReports);

      expect(areas.length).toBe(2);
      const ward12 = areas.find((a) => a.areaName.includes('Ward 12'));
      expect(ward12).toBeDefined();
      expect(ward12?.totalReports).toBe(2);
      expect(ward12?.openCases).toBe(1);
      expect(ward12?.resolvedCases).toBe(1);
      expect(ward12?.mostCommonCategory).toBe('ROAD');
      expect(ward12?.avgResolutionTimeDays).toBeCloseTo(2.0, 1);
    });
  });

  describe('4. Recurring Location & Trend Intelligence', () => {
    it('detects recurring report clusters across different dates', () => {
      const mockReports = [
        { id: 'r1', latitude: 10.8290, longitude: 78.6935, category: 'DRAINAGE', locationText: 'Chatram Canal', createdAt: new Date('2026-05-10') },
        { id: 'r2', latitude: 10.8291, longitude: 78.6936, category: 'DRAINAGE', locationText: 'Chatram Canal', createdAt: new Date('2026-07-15') },
        { id: 'r3', latitude: 10.8292, longitude: 78.6934, category: 'DRAINAGE', locationText: 'Chatram Canal', createdAt: new Date('2026-09-01') },
      ];

      const recurring = detectRecurringLocations(mockReports, 150);

      expect(recurring.length).toBeGreaterThanOrEqual(1);
      expect(recurring[0].monthsObserved.length).toBe(3);
      expect(recurring[0].insightMessage).toContain('Repeated reports');
    });

    it('calculates category volume change percentages', () => {
      const mockReports = [
        { id: 'r1', category: 'ROAD', createdAt: new Date(Date.now() - 2 * 86400000) },
        { id: 'r2', category: 'ROAD', createdAt: new Date(Date.now() - 3 * 86400000) },
        { id: 'r3', category: 'ROAD', createdAt: new Date(Date.now() - 10 * 86400000) },
      ];

      const trends = calculateCategoryTrends(mockReports, 7);
      const roadTrend = trends.find((t) => t.category === 'ROAD');

      expect(roadTrend).toBeDefined();
      expect(roadTrend?.currentCount).toBe(2);
      expect(roadTrend?.previousCount).toBe(1);
      expect(roadTrend?.changePercent).toBe(100);
      expect(roadTrend?.trendDirection).toBe('UP');
    });
  });

  describe('5. Backend Endpoint RBAC & Strict Privacy Controls', () => {
    it('blocks unauthenticated access to /api/authority/civic-map with 401', async () => {
      const response = await request(app).get('/api/authority/civic-map');
      expect(response.status).toBe(401);
    });
  });

});
