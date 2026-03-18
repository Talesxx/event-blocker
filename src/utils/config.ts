import { events } from '../constants/events';

export interface DomainConfig {
    config: EventConfig;
    type: 'domain' | 'regex';
}

export interface AllConfigs {
    global: EventConfig;
    domains: {
        [domain: string]: DomainConfig;
    };
}

export interface EventConfig {
    mouseEvents?: {
        [eventName: string]: boolean;
    };
    keyboardEvents?: {
        [eventName: string]: boolean;
    };
    touchEvents?: {
        [eventName: string]: boolean;
    };
    wheelEvents?: {
        [eventName: string]: boolean;
    };
    focusEvents?: {
        [eventName: string]: boolean;
    };
    formEvents?: {
        [eventName: string]: boolean;
    };
    clipboardEvents?: {
        [eventName: string]: boolean;
    };
    dragEvents?: {
        [eventName: string]: boolean;
    };
    enhancedMode?: boolean;
    [eventType: string]: any;
}

// 生成默认配置
export function generateDefaultConfig(): EventConfig {
    const defaultConfig: EventConfig = {};
    for (const [eventType, eventList] of Object.entries(events)) {
        defaultConfig[eventType] = {};
        eventList.forEach(eventName => {
            defaultConfig[eventType][eventName] = false;
        });
    }
    defaultConfig.enhancedMode = false;
    return defaultConfig;
}

export function generateDefaultAllConfigs(): AllConfigs {
    return {
        global: generateDefaultConfig(),
        domains: {}
    };
}

export function getCurrentDomain(): string {
    try {
        return window.location.hostname;
    } catch (e) {
        return '';
    }
}

export function getSubdomain(domain: string): string {
    return domain;
}

export function getAllConfigs(): AllConfigs {
    const oldConfig = GM_getValue('eventBlockerConfig', null);
    let allConfigs = GM_getValue('eventBlockerAllConfigs', null);
    
    if (!allConfigs) {
        allConfigs = generateDefaultAllConfigs();
        
        if (oldConfig) {
            allConfigs.global = oldConfig;
            GM_setValue('eventBlockerAllConfigs', allConfigs);
        }
    }
    
    return allConfigs;
}

export function getEffectiveConfig(): EventConfig {
    const allConfigs = getAllConfigs();
    const currentDomain = getCurrentDomain();
    
    let matchedDomain: string | null = null;
    let matchedRegex: string | null = null;
    
    const fullDomain = currentDomain;
    
    for (const [domain, domainConfig] of Object.entries(allConfigs.domains)) {
        if (domainConfig.type === 'domain') {
            if (domain === fullDomain) {
                matchedDomain = domain;
                break;
            }
        } else if (domainConfig.type === 'regex') {
            try {
                const regex = new RegExp(domain);
                if (regex.test(currentDomain)) {
                    matchedRegex = domain;
                }
            } catch (e) {
                console.warn('Invalid regex pattern:', domain);
            }
        }
    }
    
    if (matchedDomain) {
        return allConfigs.domains[matchedDomain].config;
    }
    
    if (matchedRegex) {
        return allConfigs.domains[matchedRegex].config;
    }
    
    return allConfigs.global;
}

export function saveGlobalConfig(config: EventConfig) {
    const allConfigs = getAllConfigs();
    allConfigs.global = config;
    GM_setValue('eventBlockerAllConfigs', allConfigs);
}

export function saveDomainConfig(domain: string, config: EventConfig, type: 'domain' | 'regex' = 'domain') {
    const allConfigs = getAllConfigs();
    allConfigs.domains[domain] = {
        config,
        type
    };
    GM_setValue('eventBlockerAllConfigs', allConfigs);
}

export function deleteDomainConfig(domain: string) {
    const allConfigs = getAllConfigs();
    delete allConfigs.domains[domain];
    GM_setValue('eventBlockerAllConfigs', allConfigs);
}

// 保存配置
export function saveConfig(config: EventConfig) {
    for (const [eventType, eventList] of Object.entries(events)) {
        if (!config[eventType]) {
            config[eventType] = {};
        }
        eventList.forEach(eventName => {
            const checkbox = document.getElementById(`event-${eventType}-${eventName}`) as HTMLInputElement;
            if (checkbox) {
                config[eventType][eventName] = checkbox.checked;
            }
        });
    }
    
    const enhancedModeCheckbox = document.getElementById('enhanced-mode-toggle') as HTMLInputElement;
    if (enhancedModeCheckbox) {
        config.enhancedMode = enhancedModeCheckbox.checked;
    }
}