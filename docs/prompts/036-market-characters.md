# Market and Header characters — September 10, 2026

User: “我們在Market 頁面你覺得有沒有機會加上呢, 還有header 的部分 換上不同角色的 人物可以出現吧?”

Context: the completed pixel-style motion infographic, generated hall and
Admin/Seller/Buyer atlas. This asks to extend that visual language to Market
and show the currently recognized role's character in Header. It does not
request a role selector, wallet shortcut, new trading operation or deployment.
Effective implementation scope: plan013. Reuse the existing original assets.

User follow-up: “我看切到overview 後,整個tab 都會跑版呢”

Follow-up: Victor reports all tabs shifting after returning to Overview. Include
src/App.tsx and presentation.css shell alignment/route-scroll fixes: the wide
Demo stage must not resize navigation; Exit Demo stays below navigation. Verify
all four routes in normal/Demo modes and preserve mounted operational state.
