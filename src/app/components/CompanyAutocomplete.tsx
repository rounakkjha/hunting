import { useState, useRef, useEffect, useMemo } from 'react';
import { Building2, Search } from 'lucide-react';

const POPULAR_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Tesla', 'Nvidia',
  'Adobe', 'Salesforce', 'Oracle', 'SAP', 'IBM', 'Intel', 'AMD', 'Qualcomm',
  'Cisco', 'VMware', 'Dell', 'HP', 'Lenovo', 'Samsung', 'Sony', 'LG',
  'Uber', 'Lyft', 'Airbnb', 'DoorDash', 'Instacart', 'Stripe', 'Square', 'PayPal',
  'Shopify', 'Atlassian', 'Slack', 'Zoom', 'Dropbox', 'Box', 'Twilio', 'Snowflake',
  'Databricks', 'Palantir', 'Cloudflare', 'Datadog', 'MongoDB', 'Elastic', 'Confluent',
  'HashiCorp', 'GitLab', 'GitHub', 'Vercel', 'Netlify', 'Supabase', 'Firebase',
  'Twitter', 'X Corp', 'LinkedIn', 'Pinterest', 'Snap', 'Reddit', 'Discord', 'Spotify',
  'ByteDance', 'TikTok', 'Tencent', 'Alibaba', 'Baidu', 'JD.com', 'Xiaomi', 'Huawei',
  'Infosys', 'TCS', 'Wipro', 'HCL Technologies', 'Tech Mahindra', 'Cognizant',
  'Accenture', 'Deloitte', 'PwC', 'EY', 'KPMG', 'McKinsey', 'BCG', 'Bain',
  'Goldman Sachs', 'JPMorgan Chase', 'Morgan Stanley', 'Bank of America', 'Citi',
  'Wells Fargo', 'HSBC', 'Barclays', 'Deutsche Bank', 'UBS', 'Credit Suisse',
  'Visa', 'Mastercard', 'American Express', 'Capital One', 'Robinhood', 'Coinbase',
  'Binance', 'Ripple', 'Plaid', 'Brex', 'Chime', 'SoFi', 'Revolut', 'Wise',
  'SpaceX', 'Blue Origin', 'Lockheed Martin', 'Boeing', 'Raytheon', 'Northrop Grumman',
  'Walmart', 'Target', 'Costco', 'Home Depot', 'Nike', 'Adidas', 'Puma',
  'Coca-Cola', 'PepsiCo', 'Nestlé', 'Unilever', 'P&G', 'Johnson & Johnson',
  'Pfizer', 'Moderna', 'AstraZeneca', 'Roche', 'Novartis', 'Merck',
  'Toyota', 'Ford', 'GM', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Rivian', 'Lucid',
  'Flipkart', 'Swiggy', 'Zomato', 'PhonePe', 'Paytm', 'Razorpay', 'CRED',
  'Zerodha', 'Groww', 'Byju\'s', 'Ola', 'Meesho', 'Dream11', 'Nykaa',
  'Freshworks', 'Zoho', 'MuSigma', 'Postman', 'BrowserStack', 'Chargebee',
  'Notion', 'Figma', 'Canva', 'Miro', 'Airtable', 'Asana', 'Monday.com',
  'Jira', 'Trello', 'Linear', 'ClickUp', 'Basecamp', 'Todoist',
  'Twitch', 'YouTube', 'Vimeo', 'Roku', 'Hulu', 'Disney', 'Warner Bros',
  'Siemens', 'Bosch', 'ABB', 'Honeywell', 'GE', 'Schneider Electric', '3M',
  'Roblox', 'Epic Games', 'Unity', 'EA', 'Activision', 'Riot Games', 'Valve',
  'Okta', 'CrowdStrike', 'Palo Alto Networks', 'Fortinet', 'SentinelOne', 'Zscaler',
  'Workday', 'ServiceNow', 'HubSpot', 'Zendesk', 'Intercom', 'Mailchimp',
  'Red Hat', 'Canonical', 'SUSE', 'Docker', 'Kubernetes', 'Terraform',
  'Waymo', 'Cruise', 'Nuro', 'Aurora', 'Argo AI', 'Mobileye',
  'OpenAI', 'Anthropic', 'Cohere', 'Stability AI', 'Midjourney', 'Hugging Face',
  'Reliance', 'Tata Group', 'Mahindra', 'Adani', 'L&T', 'Godrej',
  'Jio', 'Airtel', 'Vodafone', 'T-Mobile', 'Verizon', 'AT&T',
  'Grab', 'Gojek', 'Sea Group', 'Shopee', 'Lazada', 'Tokopedia',
  'Block', 'Toast', 'Lightspeed', 'BigCommerce', 'WooCommerce', 'Magento',
  'Lululemon', 'Under Armour', 'Gap', 'H&M', 'Zara', 'IKEA',
  'ThoughtSpot', 'Tableau', 'Power BI', 'Looker', 'Qlik', 'Sisense',
  'Splunk', 'New Relic', 'Dynatrace', 'AppDynamics', 'Grafana', 'Prometheus',
  'Akamai', 'Fastly', 'DigitalOcean', 'Linode', 'Vultr', 'Hetzner',
  'AWS', 'Azure', 'GCP', 'Heroku', 'Render', 'Railway', 'Fly.io',
];

interface CompanyAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  knownCompanies?: string[];
  onAddCompany?: (company: string) => void;
}

export default function CompanyAutocomplete({
  value,
  onChange,
  placeholder = 'e.g., Google',
  required = false,
  className = '',
  knownCompanies = [],
  onAddCompany,
}: CompanyAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Merge popular companies with user's known companies (deduplicated)
  const allCompanies = useMemo(() => {
    const combined = [...new Set([...POPULAR_COMPANIES, ...knownCompanies])];
    return combined.sort();
  }, [knownCompanies]);

  useEffect(() => {
    if (value.length >= 1) {
      const query = value.toLowerCase();
      const filtered = allCompanies.filter((c) =>
        c.toLowerCase().includes(query)
      ).slice(0, 8);
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
    setHighlightIndex(-1);
  }, [value, allCompanies]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSelect = (company: string) => {
    onChange(company);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length >= 1 && suggestions.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          className={`w-full pl-10 pr-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all ${className}`}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1.5 bg-card border border-border/60 rounded-xl shadow-xl overflow-hidden animate-fade-in">
          <div className="max-h-48 overflow-y-auto">
            {suggestions.map((company, index) => (
              <button
                key={company}
                type="button"
                onClick={() => handleSelect(company)}
                onMouseEnter={() => setHighlightIndex(index)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                  index === highlightIndex
                    ? 'bg-primary/10 text-foreground'
                    : 'text-foreground/80 hover:bg-muted/50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>
                  {highlightMatch(company, value)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function highlightMatch(text: string, query: string) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-semibold text-primary">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}
