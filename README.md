# homebridge-electricitymaps

This is a Homebridge plugin that integrates with the [Electricity Maps API](https://docs.electricitymaps.com/) to display real-time electricity carbon intensity, low-carbon energy percentage, and renewable energy percentage as sensors in Apple HomeKit.

## Features

- Displays real-time **carbon intensity** (gCO₂eq/kWh).
- Shows the percentage of **low-carbon** (fossil-free) energy in the electricity grid.
- Shows the percentage of **renewable energy** (wind, solar, hydro, etc.) in the electricity grid.
- Automatically updates every 10 minutes.

## Prerequisites

- [Homebridge](https://homebridge.io/) v1.3 or newer
- Node.js v18 or newer
- An API key from [Electricity Maps](https://www.electricitymaps.com/get-our-data)

## Installation

Install the plugin via Homebridge UI or with npm:

```bash
npm install -g homebridge-electricitymaps
```

## Configuration

In Homebridge's `config.json`, configure the plugin as follows:

```json
{
  "platforms": [
    {
      "platform": "ElectricityMaps",
      "apiKey": "YOUR_ELECTRICITY_MAPS_API_KEY",
      "zone": "YOUR_ZONE_CODE"
    }
  ]
}
```

### Configuration Options

- **`apiKey`**: Your API key for accessing Electricity Maps data.
- **`zone`**: The region code for your location (e.g., `FR` for France, `US-CA` for California).

## Available Sensors

This plugin adds the following sensors to HomeKit:

- **Carbon Intensity Sensor**: Displays the current carbon intensity (gCO₂eq/kWh).
- **Low-Carbon Percentage Sensor**: Shows the percentage of low-carbon (fossil-free) energy in the grid.
- **Renewable Percentage Sensor**: Displays the percentage of renewable energy.

## Development

To develop and test the plugin locally:

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the plugin:
   ```bash
   npm run build
   ```
4. Link the plugin for Homebridge:
   ```bash
   npm link
   ```

## License

This project is licensed under the Apache-2.0 License.
