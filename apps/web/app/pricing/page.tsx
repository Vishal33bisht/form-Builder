import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Check, Sparkles, ArrowRight } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "3 forms",
      "100 responses per month",
      "Basic themes",
      "Email notifications",
      "CSV export",
      "Community support",
    ],
    limitations: [
      "No custom branding",
      "No advanced analytics",
      "No API access",
    ],
    cta: "Get Started Free",
    href: "/auth/register",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For professionals and growing teams",
    features: [
      "Unlimited forms",
      "10,000 responses per month",
      "All themes",
      "Advanced analytics",
      "CSV & JSON export",
      "Remove FormCraft branding",
      "Custom domain support",
      "Priority email support",
      "API access",
      "Team collaboration",
    ],
    limitations: [],
    cta: "Start Pro Trial",
    href: "/auth/register",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Unlimited responses",
      "Custom themes",
      "White-label solution",
      "SSO & SAML",
      "Dedicated account manager",
      "24/7 phone support",
      "SLA guarantee",
      "Custom integrations",
      "Advanced security features",
      "On-premise deployment option",
    ],
    limitations: [],
    cta: "Contact Sales",
    href: "#contact",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FormCraft</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="text-sm hover:text-primary">
              Explore
            </Link>
            <Link href="/pricing" className="text-sm hover:text-primary">
              Pricing
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Start Free</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan for your needs. Start free, upgrade when you
            grow.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative ${
                tier.popular
                  ? "border-primary shadow-lg scale-105"
                  : "border-border"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge className="px-3 py-1">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className="text-muted-foreground">{tier.period}</span>
                  )}
                </div>
                <CardDescription className="mt-2">
                  {tier.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link href={tier.href} className="w-full">
                  <Button
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                  >
                    {tier.cta}
                    {tier.name !== "Enterprise" && (
                      <ArrowRight className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20 border-t">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Can I change plans later?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. Changes
                  will be reflected in your next billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  What happens if I exceed my response limit?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  On the Free plan, your forms will stop accepting new responses
                  once you hit the limit. On paid plans, you'll be notified and
                  can upgrade if needed.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Do you offer refunds?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, we offer a 30-day money-back guarantee on all paid plans.
                  No questions asked.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Is my data secure?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely. We use industry-standard encryption and security
                  practices to keep your data safe. Enterprise plans include
                  additional security features.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="text-center space-y-4 py-12">
            <CardTitle className="text-3xl">
              Ready to Get Started?
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 text-lg">
              Join thousands of creators building beautiful forms with FormCraft
            </CardDescription>
            <div className="pt-4">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary">
                  Start Free Today <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 FormCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
