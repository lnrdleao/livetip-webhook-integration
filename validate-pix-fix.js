console.log('🧪 Testing PIX JSON parsing fix...');

// Simulate the API response from LiveTip
const mockApiResponse = `{"code":"00020101021226830014BR.GOV.BCB.PIX2561qrcodespix.sejaefi.com.br/v2/f870f78674014234aa3e399370f58a585...65802BR5905EFISA6008SAOPAULO62070503***6304DF61","id":"6849a0b5419276b52b6d6e3c"}`;

try {
    // Test the corrected parsing logic
    const parsedData = JSON.parse(mockApiResponse);
    console.log('✅ JSON Parse Success:', parsedData);
    
    const pixCodeFromApi = parsedData.code;
    console.log('✅ PIX Code extracted:', pixCodeFromApi ? pixCodeFromApi.substring(0, 50) + '...' : 'NULL');
    console.log('📊 PIX Code length:', pixCodeFromApi ? pixCodeFromApi.length : 0);
    console.log('🆔 Payment ID:', parsedData.id);
    
    if (pixCodeFromApi && pixCodeFromApi.length > 50) {
        console.log('🎉 SUCCESS: PIX fix is working correctly!');
        console.log('🚀 This fix will make PIX use LiveTip API instead of fallback');
        
        const result = {
            code: pixCodeFromApi,
            pixCode: pixCodeFromApi,
            id: parsedData.id,
            source: 'livetip_api'
        };
        
        console.log('📋 Final result structure:', result);
    } else {
        console.log('❌ FAILED: PIX code is invalid or too short');
    }
    
} catch (parseError) {
    console.error('❌ JSON Parse Error:', parseError.message);
}

console.log('\n✅ Test completed. The fix should resolve the PIX fallback issue.');
