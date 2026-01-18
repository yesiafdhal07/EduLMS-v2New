// Jest globals (describe, it, expect) are provided automatically
import { render, screen, fireEvent } from '@testing-library/react';
import { StatCard } from '@/components/ui/StatCard';
import { Star } from 'lucide-react';

describe('StatCard', () => {
    const defaultProps = {
        label: 'Total Students',
        value: 42,
        icon: <Star size={28} />,
        gradient: 'from-indigo-500',
    };

    it('renders label correctly', () => {
        render(<StatCard {...defaultProps} />);
        expect(screen.getByText('Total Students')).toBeInTheDocument();
    });

    it('renders value correctly', () => {
        render(<StatCard {...defaultProps} />);
        expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders with string value', () => {
        render(<StatCard {...defaultProps} value="100%" />);
        expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('applies gradient class correctly', () => {
        const { container } = render(<StatCard {...defaultProps} />);
        const gradientDiv = container.querySelector('.bg-gradient-to-br');
        expect(gradientDiv).toBeInTheDocument();
    });

    it('renders icon', () => {
        render(<StatCard {...defaultProps} />);
        // Icon is rendered inside a container div
        const iconContainer = screen.getByText('Total Students').closest('.relative');
        expect(iconContainer).toBeInTheDocument();
    });
});
