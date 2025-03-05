import Variables from '../config.ts';
import { GlobalVars, GlobalConst } from '../types';
const { globalVars, globalConst} = Variables;
import helpers from '../helpers.ts';

let currentLevel = 1;

export function hypetrainstart(): void {
    console.log("Current Level: " + currentLevel);

    // Create the wrapper if it doesn't exist
    if (!globalVars.HypeTrainWrapper) {
        createHypeTrainWrapper();
    }

    // Clear any existing interval
    if (globalVars.hypetimer) {
        clearInterval(globalVars.hypetimer);
    }

    // Create the train head
    createTrainHead();

    // Create the first cart
    createTrainCart();

    // Start looping through the cached avatars
    startHypeTrainLoop();
}

export function hypetrainlevelup(): void {
    currentLevel++;
    console.log("LevelUp - Current Level: " + currentLevel);

    // Add a new cart
    createTrainCart();
}

export function hypetrainprogression(userId: string): void {
    const userAvatar = getUserAvatar(userId);
    addUserToCart(userAvatar);
}

export function hypetrainfinish(): void {
    // Stop the train loop
    if (globalVars.hypetimer) {
        clearInterval(globalVars.hypetimer);
    }

    // Remove the train wrapper after animation
    if (globalVars.HypeTrainWrapper) {
        const trainWrapper = globalVars.HypeTrainWrapper;
        
        // Animate the train out of view
        // @ts-ignore - GSAP is included via CDN
        gsap.to(trainWrapper, {
            x: innerWidth + 500,
            duration: 5,
            ease: "power2.in",
            onComplete: () => {
                // Remove the train from DOM
                if (trainWrapper.parentNode) {
                    trainWrapper.parentNode.removeChild(trainWrapper);
                }
                
                // Reset variables
                globalVars.HypeTrainWrapper = undefined;
                globalVars.HypeCart = undefined;
                globalVars.hypetrainCache = [];
                currentLevel = 1;
            }
        });
    }
}

export function incomingRaid(userId: string, userName: string, viewers: number): void {
    // If hypetrain is currently active, don't show raid
    if (globalVars.HypeTrainWrapper) {
        return;
    }

    // Create a simple animated message for the raid
    const raidContainer = document.createElement('div');
    raidContainer.className = 'raid-container';
    
    // @ts-ignore - GSAP is included via CDN
    gsap.set(raidContainer, {
        position: 'absolute',
        top: '30%',
        left: '-100%',
        width: '80%',
        textAlign: 'center',
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '10px',
        color: 'white',
        fontSize: '32px',
        fontWeight: 'bold',
        zIndex: 1000
    });

    // Create message elements
    const messageEl = document.createElement('div');
    messageEl.innerHTML = `<span style="color: #ff4500;">${userName}</span> is raiding with <span style="color: #ff4500;">${viewers}</span> viewers!`;
    
    // Get user avatar
    helpers.getTwitchAvatar(userName)
    .then(avatarUrl => {
        const avatarEl = document.createElement('img');
        avatarEl.src = avatarUrl;
        avatarEl.style.width = '100px';
        avatarEl.style.height = '100px';
        avatarEl.style.borderRadius = '50%';
        avatarEl.style.margin = '10px';
        
        raidContainer.appendChild(avatarEl);
        raidContainer.appendChild(messageEl);
        document.body.appendChild(raidContainer);
        
        // Animate in
        // @ts-ignore - GSAP is included via CDN
        gsap.to(raidContainer, {
            left: '10%',
            duration: 1,
            ease: "elastic.out(1, 0.5)"
        });
        
        // Wait and then animate out
        setTimeout(() => {
            // @ts-ignore - GSAP is included via CDN
            gsap.to(raidContainer, {
                left: '-100%',
                duration: 1,
                ease: "power2.in",
                onComplete: () => {
                    if (raidContainer.parentNode) {
                        raidContainer.parentNode.removeChild(raidContainer);
                    }
                }
            });
        }, 5000);
    })
    .catch(error => {
        console.error('Error getting avatar:', error);
        
        // Fallback if avatar fails
        raidContainer.appendChild(messageEl);
        document.body.appendChild(raidContainer);
        
        // Animate in
        // @ts-ignore - GSAP is included via CDN
        gsap.to(raidContainer, {
            left: '10%',
            duration: 1,
            ease: "elastic.out(1, 0.5)"
        });
        
        // Wait and then animate out
        setTimeout(() => {
            // @ts-ignore - GSAP is included via CDN
            gsap.to(raidContainer, {
                left: '-100%',
                duration: 1,
                ease: "power2.in",
                onComplete: () => {
                    if (raidContainer.parentNode) {
                        raidContainer.parentNode.removeChild(raidContainer);
                    }
                }
            });
        }, 5000);
    });
}

// Helper functions

function createHypeTrainWrapper(): void {
    const wrapper = document.createElement('div');
    wrapper.className = 'hype-train-wrapper';
    
    // @ts-ignore - GSAP is included via CDN
    gsap.set(wrapper, {
        position: 'absolute',
        bottom: '10%',
        left: '-1000px', // Start off-screen
        width: 'auto',
        height: '150px',
        display: 'flex',
        alignItems: 'flex-end',
        zIndex: 1000
    });
    
    document.body.appendChild(wrapper);
    globalVars.HypeTrainWrapper = wrapper;
    
    // Animate the train into view
    // @ts-ignore - GSAP is included via CDN
    gsap.to(wrapper, {
        left: '50px',
        duration: 2,
        ease: "power2.out"
    });
}

function createTrainHead(): void {
    if (!globalVars.HypeTrainWrapper) return;
    
    const trainHead = document.createElement('div');
    trainHead.className = 'train-head';
    
    // @ts-ignore - GSAP is included via CDN
    gsap.set(trainHead, {
        position: 'relative',
        width: '200px',
        height: '120px',
        backgroundImage: 'url(/assets/img/trainhead.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        marginRight: '10px'
    });
    
    globalVars.HypeTrainWrapper.appendChild(trainHead);
    
    // Add some smoke/steam effect
    createSteamEffect(trainHead);
}

function createTrainCart(): void {
    if (!globalVars.HypeTrainWrapper) return;
    
    const cart = document.createElement('div');
    cart.className = 'train-cart';
    
    // Choose cart image based on current level
    const cartImage = `cart${Math.min(currentLevel, 4)}.png`;
    
    // @ts-ignore - GSAP is included via CDN
    gsap.set(cart, {
        position: 'relative',
        width: '120px',
        height: '100px',
        backgroundImage: `url(/assets/img/${cartImage})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        marginRight: '10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    });
    
    // Animate the cart entering
    // @ts-ignore - GSAP is included via CDN
    gsap.from(cart, {
        x: -100,
        opacity: 0,
        duration: 1,
        ease: "elastic.out(1, 0.5)"
    });
    
    globalVars.HypeTrainWrapper.appendChild(cart);
    globalVars.HypeCart = cart;
    
    // When adding a new cart, create the avatars container
    const avatarsContainer = document.createElement('div');
    avatarsContainer.className = 'avatars-container';
    
    // @ts-ignore - GSAP is included via CDN
    gsap.set(avatarsContainer, {
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px'
    });
    
    cart.appendChild(avatarsContainer);
}

function startHypeTrainLoop(): void {
    // Set up a loop to cycle through avatars in the cache
    globalVars.hypetimer = setInterval(() => {
        // If there are avatars in the cache, cycle them
        if (globalVars.hypetrainCache.length > 0) {
            const username = globalVars.hypetrainCache[0];
            
            // If we have an avatar to show
            if (username) {
                // Get the avatar and add it to current cart
                getUserAvatar(username)
                    .then(avatarUrl => {
                        addUserToCart(avatarUrl);
                    })
                    .catch(err => {
                        console.error("Error getting avatar:", err);
                    });
                
                // Rotate the cache
                globalVars.hypetrainCache.push(globalVars.hypetrainCache.shift() || "");
            }
        }
    }, 3000); // Cycle every 3 seconds
}

function getUserAvatar(userId: string): Promise<string> {
    if (userId === "placeholder") {
        return Promise.resolve("https://static-cdn.jtvnw.net/jtv_user_pictures/8e051a26-051f-4abe-bcfa-e13a5d13fad0-profile_image-300x300.png");
    }
    
    return helpers.getTwitchAvatar(userId, true);
}

function addUserToCart(avatarUrl: string): void {
    if (!globalVars.HypeCart) return;
    
    // Find the avatars container in the current cart
    const avatarsContainer = globalVars.HypeCart.querySelector('.avatars-container');
    if (!avatarsContainer) return;
    
    // Check if we have space for more avatars (max 4)
    if (avatarsContainer.children.length >= 4) return;
    
    // Create avatar element
    const avatar = document.createElement('div');
    avatar.className = 'hype-avatar';
    
    // @ts-ignore - GSAP is included via CDN
    gsap.set(avatar, {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundImage: `url(${avatarUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        margin: '2px',
        opacity: 0,
        scale: 0.5
    });
    
    avatarsContainer.appendChild(avatar);
    
    // Animate avatar appearing
    // @ts-ignore - GSAP is included via CDN
    gsap.to(avatar, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.7)"
    });
}

function createSteamEffect(trainHead: HTMLElement): void {
    // Create steam particles periodically
    const steamInterval = setInterval(() => {
        // If train is no longer in DOM, clear the interval
        if (!trainHead.parentNode) {
            clearInterval(steamInterval);
            return;
        }
        
        const steamParticle = document.createElement('div');
        // @ts-ignore - GSAP is included via CDN
        gsap.set(steamParticle, {
            position: 'absolute',
            width: '20px',
            height: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '50%',
            top: '20px',
            left: '50px',
            opacity: 0.7,
            scale: 0.1
        });
        
        trainHead.appendChild(steamParticle);
        
        // Animate the steam rising and fading
        // @ts-ignore - GSAP is included via CDN
        gsap.to(steamParticle, {
            y: '-=70',
            x: '+=20',
            opacity: 0,
            scale: 1.5,
            duration: 2,
            ease: "power1.out",
            onComplete: () => {
                if (steamParticle.parentNode) {
                    steamParticle.parentNode.removeChild(steamParticle);
                }
            }
        });
    }, 500);
}