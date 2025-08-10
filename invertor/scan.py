from pymodbus.client import ModbusTcpClient
from pymodbus.exceptions import ModbusException
import time

ip = "192.168.8.201"
port = 502
unit_id = 1

client = ModbusTcpClient(ip, port=port)
client.connect()

start_address = 0
end_address = 10000  # Conservative upper limit, adjust if needed
chunk_size = 20      # You can increase/decrease this

valid_chunks = []

try:
    for addr in range(start_address, end_address, chunk_size):
        print(f"Reading address {addr} to {addr + chunk_size - 1}...", end=" ")
        result = client.read_holding_registers(addr)

        if not result.isError() and hasattr(result, "registers"):
            print("✅ Valid")
            valid_chunks.append((addr, result.registers))
        else:
            print("❌ Error or no response")

        time.sleep(0.2)  # Pause to avoid overwhelming the inverter

except ModbusException as e:
    print("Modbus error:", e)

finally:
    client.close()

# Print valid data
for chunk in valid_chunks:
    addr, data = chunk
    print(f"\nRegisters {addr} to {addr + len(data) - 1}:")
    for i, val in enumerate(data):
        print(f"  [{addr + i}] = {val}")
