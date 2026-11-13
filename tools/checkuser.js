/**
 * tools/checkuser.js
 * 负责检查用户登录状态和 XML 验证
 */
const CheckUser = (function() {
    
    // 获取 Cookie 的辅助函数
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // 检查是否有基础的登录态
    function hasLocalSession() {
        const localUser = localStorage.getItem('ice_user');
        const cookieUser = getCookie('ice_user');
        return localUser || cookieUser;
    }

    // 去服务器拉取 XML 验证（防止用户手动改 localStorage 伪造）
    async function verifyWithXML(username) {
        try {
            const res = await fetch('res/userlist.xml');
            if (!res.ok) return false;
            const text = await res.text();
            
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");
            const users = xmlDoc.getElementsByTagName("user");
            
            for (let i = 0; i < users.length; i++) {
                const nameNode = users[i].getElementsByTagName("name")[0];
                const statusNode = users[i].getElementsByTagName("status")[0];
                // 如果名字匹配，并且状态不是 banned（封禁）
                if (nameNode && nameNode.textContent === username) {
                    if (statusNode && statusNode.textContent === 'banned') {
                        return false; 
                    }
                    return true;
                }
            }
            return false;
        } catch (e) {
            console.error("XML 验证失败:", e);
            return false;
        }
    }

    // 核心检查函数：返回 Promise<boolean>
    async function check() {
        const user = hasLocalSession();
        if (!user) return false;
        
        // 如果本地有缓存，去 XML 里复核一下
        const isValid = await verifyWithXML(user);
        return isValid;
    }

    // 登出
    function logout() {
        localStorage.removeItem('ice_user');
        document.cookie = "ice_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }

    return {
        check: check,
        logout: logout,
        getCurrentUser: function() {
            return localStorage.getItem('ice_user') || getCookie('ice_user');
        }
    };
})();