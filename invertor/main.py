from pymodbus.client import ModbusTcpClient
from pymodbus.exceptions import ModbusException
import time

client = ModbusTcpClient("192.168.8.201", port=502)
client.connect()

start_address = 0
end_address = 2000
chunk_size = 50

try:
    for addr in range(start_address, end_address, chunk_size):
        print(f"\nReading holding registers {addr} to {addr + chunk_size - 1}...")

        response = client.read_holding_registers(address=addr, count=chunk_size)

        if not response.isError():
            for i, reg in enumerate(response.registers):
                print(f"  Register {addr + i}: {reg}")
        else:
            print(f"  ❌ Error reading from {addr}")

        time.sleep(0.2)  # Small delay to avoid flooding the inverter

except ModbusException as e:
    print("Modbus Exception:", e)

finally:
    client.close()
