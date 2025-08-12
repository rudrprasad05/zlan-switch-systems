import os
from pymodbus.client import ModbusTcpClient
import struct
import time
import requests
from dotenv import load_dotenv

load_dotenv() 

# --- CONFIGURATION ---
ZLAN_IP = os.getenv("ZLAN_IP")
PORT = os.getenv("ZLAN_PORT")
METER_IDS = [1, 2] 
BACKEND_URL = os.getenv("BACKEND_URL")

# Register addresses (Eastron SDM630)
REGISTERS = {
    "Voltage": 0,
    "Current": 6,
    "Power": 12,
    "Frequency": 70,
    "Energy": 342
}

# --- Helper: Decode IEEE 754 Float ---
def decode_ieee754(regs):
    raw = struct.pack('>HH', *regs)
    return struct.unpack('>f', raw)[0]

# --- Helper: Read 2 registers and decode float ---
def read_float(client, address, slave_id, label):
    try:
        result = client.read_input_registers(address=address, count=2)
        if result.isError() or not hasattr(result, "registers"):
            print(f"❌ Meter {slave_id} - {label} read failed")
            return None
        return decode_ieee754(result.registers)
    except Exception as e:
        print(f"❌ Meter {slave_id} - {label} error: {e}")
        return None

# --- MAIN ---
print("📟 Starting dual meter read via ZLAN...")
client = ModbusTcpClient(ZLAN_IP, port=PORT)

if not client.connect():
    print("❌ Could not connect to ZLAN")
    exit()

try:
    while True:
        for meter_id in METER_IDS:
            print(f"\n📊 Readings from Meter ID {meter_id}:")
            voltage = read_float(client, REGISTERS["Voltage"],   meter_id, "Voltage")
            current = read_float(client, REGISTERS["Current"],   meter_id, "Current")
            power   = read_float(client, REGISTERS["Power"],     meter_id, "Power")
            freq    = read_float(client, REGISTERS["Frequency"], meter_id, "Frequency")
            energy  = read_float(client, REGISTERS["Energy"],    meter_id, "Energy")

            data = {
                "timestamp": time.time(),
                "meter_id": meter_id,
                "voltage": voltage,
                "current": current,
                "power": power,
                "frequency": freq,
                "energy": energy
            }
            try:
                res = requests.post(f"{BACKEND_URL}/api/readings", json=data)
                if res.status_code != 200:
                    print(f"❌ Failed to post data for meter {meter_id}")
            except Exception as e:
                print(f"❌ Error posting to backend: {e}")

            print(f"🔌 Voltage:   {voltage:.2f} V" if voltage else "❌ Voltage failed")
            print(f"⚡ Current:   {current:.3f} A" if current else "❌ Current failed")
            print(f"🔆 Power:     {power:.2f} W"  if power else "❌ Power failed")
            print(f"🎵 Frequency: {freq:.2f} Hz"   if freq else "❌ Frequency failed")
            print(f"🔋 Energy:    {energy:.3f} kWh" if energy else "❌ Energy failed")

        time.sleep(60)

except KeyboardInterrupt:
    print("\n🛑 Logging stopped by user.")
finally:
    client.close()
