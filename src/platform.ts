import axios from 'axios';
import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';
import { ElectricityMapsAccessory } from './platformAccessory.js';

const BASE_API_URL = 'https://api.electricitymap.org/v3';

interface ElectricityMetrics {
  carbonIntensity: {
    carbonIntensity: number;
  };
  fossilFreePercentage: number;
  renewablePercentage: number;
}

export class ElectricityMapsPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service;
  public readonly Characteristic: typeof Characteristic;
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.Service = this.api.hap.Service;
    this.Characteristic = this.api.hap.Characteristic;

    this.log.debug('Finished initializing platform:', this.config.name);

    if (!this.config.apiKey || !this.config.zone) {
      this.log.error('API key and zone must be set in the Homebridge configuration.');
      return;
    }

    this.api.on('didFinishLaunching', () => {
      this.discoverDevices();
    });
  }

  // Discover or restore devices
  discoverDevices() {
    const uuid = this.api.hap.uuid.generate('electricity-maps-accessory');
    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    if (existingAccessory) {
      this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
      new ElectricityMapsAccessory(this, existingAccessory);
    } else {
      this.log.info('Adding new accessory for Electricity Maps data.');
      const accessory = new this.api.platformAccessory('Electricity Maps Data', uuid);
      accessory.context.device = { name: 'Electricity Maps Data' };
      new ElectricityMapsAccessory(this, accessory);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  // Fetch all relevant electricity data: carbon intensity, fossil-free, and renewable percentages
  async fetchElectricityMetrics(): Promise<ElectricityMetrics | null> {
    const { apiKey, zone } = this.config;

    try {
      // Fetch carbon intensity
      const intensityUrl = `${BASE_API_URL}/carbon-intensity/latest?zone=${zone}`;
      const intensityResponse = await axios.get(intensityUrl, {
        headers: { 'auth-token': apiKey },
      });
      const carbonIntensity = intensityResponse.data;

      // Fetch power breakdown (fossil-free and renewable percentages)
      const breakdownUrl = `${BASE_API_URL}/power-breakdown/latest?zone=${zone}`;
      const breakdownResponse = await axios.get(breakdownUrl, {
        headers: { 'auth-token': apiKey },
      });
      const powerBreakdown = breakdownResponse.data;

      return {
        carbonIntensity,
        fossilFreePercentage: powerBreakdown.fossilFreePercentage,
        renewablePercentage: powerBreakdown.renewablePercentage,
      };
    } catch (error) {
      this.log.error('Error fetching electricity metrics:', error);
      return null;
    }
  }
}
