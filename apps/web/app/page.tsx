import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Sparkles,
  Palette,
  BarChart3,
  Share2,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FormCraft</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="text-sm hover:text-primary">
              Explore
            </Link>
            <Link href="/pricing" className="text-sm hover:text-primary">
              Pricing
            </Link>
            <Link
              href="http://localhost:8000/docs"
              target="_blank"
              className="text-sm hover:text-primary"
            >
              API Docs
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Build Forms That Feel{" "}
            <span className="text-primary">Human</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Create beautiful, engaging forms in minutes. No coding required.
            Choose from stunning themes, get powerful analytics, and share
            anywhere.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/auth/register">
              <Button size="lg" className="gap-2">
                Start Building Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline">
                Explore Forms
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            No credit card required • Free forever plan
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful features to create, customize, and analyze your forms
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Drag & Drop Builder</CardTitle>
              <CardDescription>
                Build forms in seconds with our intuitive drag-and-drop
                interface. No technical skills needed.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Palette className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Beautiful Themes</CardTitle>
              <CardDescription>
                Choose from movie, anime, game, and tech-inspired themes. Make
                your forms stand out.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Powerful Analytics</CardTitle>
              <CardDescription>
                Track responses, analyze trends, and export data. Get insights
                that matter.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Share2 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Easy Sharing</CardTitle>
              <CardDescription>
                Share via custom URLs, embed anywhere, or make forms public for
                everyone to discover.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 bg-muted/50 rounded-lg">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground">
            Three simple steps to create amazing forms
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
              1
            </div>
            <h3 className="text-xl font-semibold">Create Your Form</h3>
            <p className="text-muted-foreground">
              Choose a template or start from scratch. Add fields with drag and
              drop.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
              2
            </div>
            <h3 className="text-xl font-semibold">Customize & Style</h3>
            <p className="text-muted-foreground">
              Pick a theme, set validations, and configure settings. Make it
              yours.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
              3
            </div>
            <h3 className="text-xl font-semibold">Share & Collect</h3>
            <p className="text-muted-foreground">
              Publish your form and start collecting responses. Analyze results
              in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Loved by Creators</h2>
          <p className="text-muted-foreground">
            See what people are saying about FormCraft
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  JD
                </div>
                <div>
                  <p className="font-semibold">Jane Doe</p>
                  <p className="text-sm text-muted-foreground">
                    Product Manager
                  </p>
                </div>
              </div>
              <CardDescription>
                "FormCraft made it so easy to gather user feedback. The themes
                are gorgeous and the analytics are super helpful!"
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  AS
                </div>
                <div>
                  <p className="font-semibold">Alex Smith</p>
                  <p className="text-sm text-muted-foreground">
                    Indie Developer
                  </p>
                </div>
              </div>
              <CardDescription>
                "Finally, a form builder that doesn't feel corporate. The
                cyberpunk theme is perfect for my gaming community!"
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  MK
                </div>
                <div>
                  <p className="font-semibold">Maya Kumar</p>
                  <p className="text-sm text-muted-foreground">
                    Event Organizer
                  </p>
                </div>
              </div>
              <CardDescription>
                "The drag-and-drop builder is incredibly intuitive. I created a
                registration form in under 5 minutes!"
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="text-center space-y-4 py-12">
            <CardTitle className="text-4xl">
              Ready to Build Something Amazing?
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Join thousands of creators using FormCraft to build beautiful
              forms. Start free, no credit card required.
            </CardDescription>
            <div className="pt-4">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="gap-2">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-bold">FormCraft</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Build forms that feel human.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/explore" className="hover:text-primary">
                    Explore Forms
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-primary">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="http://localhost:8000/docs"
                    target="_blank"
                    className="hover:text-primary"
                  >
                    API Documentation
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 FormCraft. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
