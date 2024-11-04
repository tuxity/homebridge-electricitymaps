import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { ElectricityMapsPlatform } from './platform.js';

export class ElectricityMapsAccessory {
  private carbonIntensity: number = 0;
  private fossilFreePercentage: number = 0;
  private renewablePercentage: number = 0;

  private carbonIntensityService: Service;
  private fossilFreeService: Service;
  private renewableService: Service;

  constructor(
    private readonly platform: ElectricityMapsPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    // Set up Carbon Intensity Sensor
    this.carbonIntensityService = this.accessory.getService('Carbon Intensity')
      || this.accessory.addService(this.platform.Service.CarbonDioxideSensor, 'Carbon Intensity', 'carbon-intensity');
    this.carbonIntensityService.getCharacteristic(this.platform.Characteristic.CarbonDioxideLevel)
      .onGet(this.getCarbonIntensity.bind(this));

    // Set up Low-Carbon Percentage Sensor
    this.fossilFreeService = this.accessory.getService('Low-Carbon Percentage')
      || this.accessory.addService(this.platform.Service.HumiditySensor, 'Low-Carbon Percentage', 'low-carbon');
    this.fossilFreeService.getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
      .onGet(this.getFossilFreePercentage.bind(this));

    // Set up Renewable Percentage Sensor
    this.renewableService = this.accessory.getService('Renewable Percentage')
      || this.accessory.addService(this.platform.Service.Battery, 'Renewable Percentage', 'renewable');
    this.renewableService.getCharacteristic(this.platform.Characteristic.BatteryLevel)
      .onGet(this.getRenewablePercentage.bind(this));

    this.updateElectricityMetrics();
    setInterval(() => {
      this.updateElectricityMetrics();
    }, 10 * 60 * 1000); // Update every 10 minutes
  }

  getCarbonIntensity(): CharacteristicValue {
    return this.carbonIntensity;
  }

  getFossilFreePercentage(): CharacteristicValue {
    return this.fossilFreePercentage;
  }

  getRenewablePercentage(): CharacteristicValue {
    return this.renewablePercentage;
  }

  async updateElectricityMetrics() {
    try {
      const metrics = await this.platform.fetchElectricityMetrics();
      if (metrics) {
        this.carbonIntensity = metrics.carbonIntensity.carbonIntensity;
        this.fossilFreePercentage = metrics.fossilFreePercentage;
        this.renewablePercentage = metrics.renewablePercentage;

        // Update HomeKit characteristics
        this.carbonIntensityService.updateCharacteristic(this.platform.Characteristic.CarbonDioxideLevel, this.carbonIntensity);
        this.fossilFreeService.updateCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, this.fossilFreePercentage);
        this.renewableService.updateCharacteristic(this.platform.Characteristic.BatteryLevel, this.renewablePercentage);
      }
    } catch (error) {
      this.platform.log.error('Error updating electricity metrics:', error);
    }
  }
}
