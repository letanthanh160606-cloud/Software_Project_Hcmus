export default function PromptContextmodule() {
    return(
        <div
        style={{
            width: '95%',
            display: "flex",
            flexDirection: "row",
            gap: '20px'
        }}>
            {/* Left Section - Prompt Template */}
            <div style={{
                width: '50%',
                backgroundColor: 'rgba(255,255,255,0.5)',
                height: 'calc(100vh - 94px)',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: "column",
                padding: '20px'
            }}>
                <div style={{
                    fontFamily: 'Satoshi',
                    fontWeight: '700',
                    color: '#443e36',
                    fontSize: '16px'
                }}>Prompt Template</div>
            </div>

            {/* Right Section - Context */}
            <div style={{
                width: '50%',
                backgroundColor: 'rgba(255,255,255,0.5)',
                height: 'calc(100vh - 94px)',
                borderRadius: '20px',
                padding: '20px'
            }}>
                <div style={{
                    fontFamily: 'Satoshi',
                    fontWeight: '700',
                    fontSize: '16px',
                    color: '#443e36',
                }}>
                    Context
                </div>
            </div>
        </div>
    );
}